use chrono::Utc;
use db::notes::NotesDb;
use db::win_pos::WinPosDb;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};
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
}

fn spawn_window(
    app: tauri::AppHandle,
    label: String,
    url: String,
    size: (f64, f64),
) -> tauri::Result<()> {
    // If already open, just focus it
    if let Some(window) = app.get_webview_window(&label) {
        window.set_focus()?;
        return Ok(());
    }

    let saved = app.state::<WinPosDb>().get(&label).ok().flatten();
    let window = tauri::WebviewWindowBuilder::new(&app, &label, tauri::WebviewUrl::App(url.into()))
        .inner_size(size.0, size.1)
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

fn spawn_notes_list_window(app: tauri::AppHandle) -> tauri::Result<()> {
    spawn_window(
        app,
        "notes_list".to_string(),
        "index.html".to_string(),
        (320.0, 640.0),
    )
}

fn spawn_note_window(app: tauri::AppHandle, note_id: String) -> tauri::Result<()> {
    spawn_window(
        app,
        format!("note-{note_id}"),
        format!("index.html?note_id={note_id}"),
        (305.0, 312.0),
    )
}

#[tauri::command]
async fn open_notes_list(app: tauri::AppHandle) -> Result<(), String> {
    spawn_notes_list_window(app).map_err(|error| format!("Failed to spawn window: {error}"))
}

#[tauri::command]
async fn open_note(app: tauri::AppHandle, note_id: String) -> Result<(), String> {
    spawn_note_window(app, note_id).map_err(|error| format!("Failed to spawn window: {error}"))
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
            create_note,
            get_note,
            get_notes,
            update_note,
            delete_note,
        ])
        .setup(|app| {
            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;

            app.manage(NotesDb::new(dir.clone())?);
            app.manage(WinPosDb::new(dir)?);

            let app = app.handle().clone();
            let note_id: Option<String> = None;

            match note_id {
                Some(note_id) => spawn_note_window(app, note_id).map_err(Into::into),
                None => spawn_notes_list_window(app).map_err(Into::into),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
