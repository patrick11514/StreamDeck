pub mod config;
pub mod streamdeck;

use std::sync::{Arc, Mutex};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state: streamdeck::SharedState = Arc::new(Mutex::new(streamdeck::DeckManager::default()));

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            streamdeck::get_streamdecks,
            streamdeck::open_streamdeck,
            streamdeck::close_streamdeck,
            streamdeck::set_brightness,
            streamdeck::get_brightness,
            streamdeck::send_image
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
