use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use tauri::{Emitter, Manager};
use uuid::Uuid;

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

static NOTES: LazyLock<Mutex<HashMap<String, Note>>> = LazyLock::new(|| Mutex::new(HashMap::new()));

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

    tauri::WebviewWindowBuilder::new(&app, label, tauri::WebviewUrl::App(url.into()))
        .inner_size(size.0, size.1)
        .decorations(false)
        .visible(false)
        .build()?;
    Ok(())
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
async fn create_note(app: tauri::AppHandle) -> Result<Note, String> {
    let mut notes = NOTES.lock().map_err(|error| error.to_string())?;
    let note_id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    let note = Note {
        id: note_id.clone(),
        content: "".to_string(),
        color: "#c78eff".to_string(),
        is_color_dark: false,
        created_at: now.clone(),
        modified_at: now,
    };

    notes.insert(note_id.clone(), note.clone());
    drop(notes);

    if let Some(window) = app.get_webview_window("notes_list") {
        let _ = window.emit("new_note", note.clone());
    }

    match spawn_note_window(app, note_id) {
        Ok(()) => Ok(note),
        Err(error) => Err(format!("Failed to spawn window: {error}")),
    }
}

#[tauri::command]
async fn get_note(note_id: String) -> Result<Note, String> {
    let notes = NOTES.lock().map_err(|error| error.to_string())?;

    match notes.get(&note_id) {
        Some(note) => Ok(note.clone()),
        None => Err("Note not found".to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            open_notes_list,
            open_note,
            create_note,
            get_note,
        ])
        .setup(|app| {
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
