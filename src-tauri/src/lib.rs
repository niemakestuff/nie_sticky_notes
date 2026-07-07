fn spawn_window(
    app: tauri::AppHandle,
    label: String,
    url: String,
    size: (f64, f64),
) -> tauri::Result<()> {
    tauri::WebviewWindowBuilder::new(&app, label, tauri::WebviewUrl::App(url.into()))
        .inner_size(size.0, size.1)
        .decorations(false)
        .visible(false)
        .build()?;
    Ok(())
}

fn _spawn_notes_list_window(app: tauri::AppHandle) -> tauri::Result<()> {
    spawn_window(
        app,
        "notes_list".to_string(),
        "index.html".to_string(),
        (320.0, 640.0),
    )
}

fn _spawn_note_window(app: tauri::AppHandle, note_id: String) -> tauri::Result<()> {
    spawn_window(
        app,
        format!("note-{note_id}"),
        format!("index.html?note_id={note_id}"),
        (305.0, 312.0),
    )
}

#[tauri::command]
async fn spawn_notes_list_window(app: tauri::AppHandle) -> tauri::Result<()> {
    _spawn_notes_list_window(app)
}

#[tauri::command]
async fn spawn_note_window(app: tauri::AppHandle, note_id: String) -> tauri::Result<()> {
    _spawn_note_window(app, note_id)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            spawn_notes_list_window,
            spawn_note_window,
        ])
        .setup(|app| {
            let app = app.handle().clone();
            let note_id: Option<String> = None;

            match note_id {
                Some(note_id) => _spawn_note_window(app, note_id).map_err(Into::into),
                None => _spawn_notes_list_window(app).map_err(Into::into),
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
