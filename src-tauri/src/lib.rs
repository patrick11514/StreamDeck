use hidapi::HidApi;

const ELGATO_VID: u16 = 0x0fd9;

#[derive(serde::Serialize)]
struct DeckInfo {
    vid: u16,
    pid: u16,
    serial: Option<String>,
    product: Option<String>,
}

#[tauri::command]
fn get_streamdecks() -> Vec<DeckInfo> {
    let api = HidApi::new().unwrap();
    api.device_list()
        .filter(|dev| dev.vendor_id() == ELGATO_VID)
        .map(|dev| DeckInfo {
            vid: dev.vendor_id(),
            pid: dev.product_id(),
            serial: dev.serial_number().map(|s| s.to_string()),
            product: dev.product_string().map(|s| s.to_string()),
        })
        .collect()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_streamdecks])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
