use std::env;

use tauri::{AppHandle, Manager};

#[tauri::command]
fn get_args() -> Vec<String> {
    std::env::args().collect()
}

#[tauri::command]
fn is_fullscreen(app: AppHandle) -> bool {
    if let Some(window) = app.get_webview_window("main") {
        window.is_fullscreen().unwrap_or(false)
    } else {
        false
    }
}

#[tauri::command]
fn toggle_fullscreen(app: AppHandle) -> bool {
    if let Some(window) = app.get_webview_window("main") {
        let is_fullscreen = window.is_fullscreen().unwrap_or(false);
        let _ = window.set_fullscreen(!is_fullscreen);
        !is_fullscreen
    } else {
        false
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_args,
            is_fullscreen,
            toggle_fullscreen
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
