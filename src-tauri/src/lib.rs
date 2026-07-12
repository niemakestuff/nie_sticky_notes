use chrono::Utc;
use db::notes::NotesDb;
use db::win_pos::WinPosDb;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};
use tauri_plugin_store::StoreExt;
use uuid::Uuid;

mod db;

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Note {
    id: String,
    content: String,
    color: String,
    is_color_dark: bool,
    created_at: String,
    modified_at: String,
    is_open: bool,
    is_pinned: bool,
}

fn spawn_window(
    app: tauri::AppHandle,
    label: String,
    url: String,
    size: (f64, f64),
    min_size: (f64, f64),
    always_on_top: bool,
) -> tauri::Result<()> {
    // If already open, just focus it
    if let Some(window) = app.get_webview_window(&label) {
        window.set_focus()?;
        return Ok(());
    }

    let saved = app.state::<WinPosDb>().get(&label).ok().flatten();
    let window = tauri::WebviewWindowBuilder::new(&app, &label, tauri::WebviewUrl::App(url.into()))
        .title("Nie Sticky Notes")
        .inner_size(size.0, size.1)
        // The min-size constraint clamps the outer rect, which includes the
        // invisible resize borders of an undecorated window (measured at 125%
        // scaling: 18 physical px wide, 10 tall = 14.4 x 8.0 logical), so pad
        // to make the *visible* area bottom out at min_size.
        .min_inner_size(min_size.0 + 14.4, min_size.1 + 8.0)
        .always_on_top(always_on_top)
        .decorations(false)
        .visible(false)
        .build()?;

    // Only restore if the saved spot still lands on a connected monitor,
    // otherwise a note could reopen off-screen (e.g. after unplugging a display).
    if let Some((x, y)) = saved {
        if position_on_screen(&window, x, y) {
            window.set_position(tauri::PhysicalPosition::new(x, y))?;
        }
    }

    Ok(())
}

/// True if the physical point (x, y) falls within any connected monitor.
fn position_on_screen(window: &tauri::WebviewWindow, x: i32, y: i32) -> bool {
    let Ok(monitors) = window.available_monitors() else {
        return true; // Can't enumerate monitors; don't discard the saved spot.
    };

    monitors.iter().any(|monitor| {
        let pos = monitor.position();
        let size = monitor.size();
        x >= pos.x && y >= pos.y && x < pos.x + size.width as i32 && y < pos.y + size.height as i32
    })
}

/// Persist a note's open state and let the notes list refresh its card.
fn set_note_open(app: &tauri::AppHandle, note_id: &str, open: bool) {
    let notes_db = app.state::<NotesDb>();
    if notes_db.set_open(note_id, open).is_err() {
        return;
    }

    if let (Some(window), Ok(note)) = (
        app.get_webview_window("notes_list"),
        notes_db.find(note_id), //
    ) {
        let _ = window.emit("updated_note", note);
    }
}

/// Persist whether the notes list window is open, so startup can bring back
/// only the windows that were open when the app exited. Saved eagerly because
/// the store's exit save doesn't run if the process is killed.
fn set_list_open(app: &tauri::AppHandle, open: bool) {
    let Ok(store) = app.store("state.json") else {
        return;
    };

    store.set("list_open", open);
    let _ = store.save();
}

fn spawn_notes_list_window(app: tauri::AppHandle) -> tauri::Result<()> {
    spawn_window(
        app.clone(),
        "notes_list".to_string(),
        "index.html".to_string(),
        (320.0, 640.0),
        (320.0, 500.0),
        false,
    )?;

    set_list_open(&app, true);
    Ok(())
}

fn spawn_note_window(app: tauri::AppHandle, note_id: String) -> tauri::Result<()> {
    // Pinned notes come back always-on-top when their window reopens.
    let pinned = app
        .state::<NotesDb>()
        .find(&note_id)
        .map(|note| note.is_pinned)
        .unwrap_or(false);

    spawn_window(
        app,
        format!("note-{note_id}"),
        format!("index.html?note_id={note_id}"),
        (305.0, 312.0),
        (192.0, 100.0),
        pinned,
    )
}

#[tauri::command]
async fn open_notes_list(app: tauri::AppHandle) -> Result<(), String> {
    spawn_notes_list_window(app).map_err(|error| format!("Failed to spawn window: {error}"))
}

#[tauri::command]
async fn open_note(app: tauri::AppHandle, note_id: String) -> Result<(), String> {
    spawn_note_window(app.clone(), note_id.clone())
        .map_err(|error| format!("Failed to spawn window: {error}"))?;

    set_note_open(&app, &note_id, true);
    Ok(())
}

// Closing is marked from the frontend (the titlebar "x") rather than on the
// window-close event: a native close (taskbar "Close all windows", Alt+F4,
// app kill) must leave the open flags untouched so those windows respawn on
// the next launch.

#[tauri::command]
async fn close_note(app: tauri::AppHandle, note_id: String) -> Result<(), String> {
    set_note_open(&app, &note_id, false);
    Ok(())
}

#[tauri::command]
async fn close_notes_list(app: tauri::AppHandle) -> Result<(), String> {
    set_list_open(&app, false);
    Ok(())
}

#[tauri::command]
async fn create_note(
    app: tauri::AppHandle,
    notes_db: tauri::State<'_, NotesDb>,
) -> Result<Note, String> {
    let note_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let note = Note {
        id: note_id.clone(),
        content: "".to_string(),
        color: "#ac94ec".to_string(),
        is_color_dark: false,
        created_at: now.clone(),
        modified_at: now,
        is_open: true,
        is_pinned: false,
    };

    notes_db.insert(&note).map_err(|error| error.to_string())?;

    if let Some(window) = app.get_webview_window("notes_list") {
        let _ = window.emit("new_note", note.clone());
    }

    match spawn_note_window(app, note_id) {
        Ok(()) => Ok(note),
        Err(error) => Err(format!("Failed to spawn window: {error}")),
    }
}

#[tauri::command]
async fn get_note(notes_db: tauri::State<'_, NotesDb>, note_id: String) -> Result<Note, String> {
    notes_db.find(&note_id).map_err(|error| match error {
        rusqlite::Error::QueryReturnedNoRows => "Note not found".to_string(),
        other => other.to_string(),
    })
}

#[tauri::command]
async fn get_notes(notes_db: tauri::State<'_, NotesDb>) -> Result<Vec<Note>, String> {
    notes_db
        .get_many(100_000)
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn search_notes(
    notes_db: tauri::State<'_, NotesDb>,
    query: String,
) -> Result<Vec<Note>, String> {
    notes_db
        .search(&query, 100_000)
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn update_note(
    app: tauri::AppHandle,
    notes_db: tauri::State<'_, NotesDb>,
    note: Note,
) -> Result<(), String> {
    notes_db.update(&note).map_err(|error| error.to_string())?;

    if let Some(window) = app.get_webview_window("notes_list") {
        let _ = window.emit("updated_note", note);
    }

    Ok(())
}

#[tauri::command]
async fn delete_note(
    app: tauri::AppHandle,
    notes_db: tauri::State<'_, NotesDb>,
    win_pos_db: tauri::State<'_, WinPosDb>,
    note_id: String,
) -> Result<Option<()>, String> {
    let removed = notes_db
        .delete(&note_id)
        .map_err(|error| error.to_string())?;

    if removed > 0 {
        let note_window_label = format!("note-{note_id}");
        let _ = win_pos_db.delete(&note_window_label);

        if let Some(window) = app.get_webview_window("notes_list") {
            let _ = window.emit("deleted_note", note_id);
        }

        if let Some(window) = app.get_webview_window(&note_window_label) {
            let _ = window.destroy();
        }
    }

    Ok((removed > 0).then_some(()))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                if let Ok(pos) = window.outer_position() {
                    let _ = window
                        .state::<WinPosDb>()
                        .save(window.label(), pos.x, pos.y);
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            open_notes_list,
            open_note,
            close_note,
            close_notes_list,
            create_note,
            get_note,
            get_notes,
            search_notes,
            update_note,
            delete_note,
        ])
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;

            app.manage(NotesDb::new(dir.clone())?);
            app.manage(WinPosDb::new(dir)?);

            let app = app.handle().clone();

            // Bring back the windows that were open when the app exited.
            // Only the frontend "x" buttons mark them closed, so a native
            // close (taskbar close-all, kill) leaves them flagged open.
            let open_note_ids = app.state::<NotesDb>().get_open_ids()?;
            let list_open = app
                .store("state.json")?
                .get("list_open")
                .and_then(|value| value.as_bool())
                .unwrap_or(true);

            // Without the fallback the app would launch with no windows at all.
            if list_open || open_note_ids.is_empty() {
                spawn_notes_list_window(app.clone())?;
            }

            for note_id in open_note_ids {
                spawn_note_window(app.clone(), note_id)?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
