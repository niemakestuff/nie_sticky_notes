#[tauri::command]
async fn spawn_notes_list_window(app: tauri::AppHandle) -> tauri::Result<()> {
    tauri::WebviewWindowBuilder::new(
        &app,
        "notes_list",
        tauri::WebviewUrl::App("index.html".into()),
    )
    .inner_size(320.0, 640.0)
    .decorations(false)
    .build()?;
    Ok(())
}

#[tauri::command]
async fn spawn_note_window(app: tauri::AppHandle, note_id: String) -> tauri::Result<()> {
    let path = format!("index.html?note_id={note_id}");
    tauri::WebviewWindowBuilder::new(
        &app,
        format!("note-{note_id}"),
        tauri::WebviewUrl::App(path.into()),
    )
    .inner_size(305.0, 312.0)
    .decorations(false)
    .build()?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            spawn_notes_list_window,
            spawn_note_window
        ])
        .setup(|app| {
            let app = app.handle().clone();
            let note_id: Option<String> = None;

            tauri::async_runtime::block_on(async move {
                match note_id {
                    Some(note_id) => spawn_note_window(app, note_id).await,
                    None => spawn_notes_list_window(app).await,
                }
            })?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
