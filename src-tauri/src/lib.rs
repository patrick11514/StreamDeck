use std::sync::{Arc, Mutex};

use anyhow_tauri::IntoTAResult;
use hidapi::HidApi;
use streamdeck::Kind;

#[derive(Clone, serde::Serialize)]
struct DeckInfo {
    kind: String,
    keys: u8,
    image_size: (usize, usize),
}

struct DeckHandle {
    serial: String,
    deck: streamdeck::StreamDeck,
    deck_info: DeckInfo,
}

#[derive(Default)]
struct DeckManager {
    current: Option<DeckHandle>,
}

type SharedState = Arc<Mutex<DeckManager>>;

const ELGATO_VID: u16 = 0x0fd9;

#[derive(serde::Serialize)]
struct ListDeckInfo {
    vid: u16,
    pid: u16,
    serial: Option<String>,
    product: Option<String>,
}

#[derive(serde::Serialize)]
struct StreamDeckListSerial {
    serial: String,
    list: Vec<ListDeckInfo>,
}

#[derive(serde::Serialize)]
enum StreamDeckList {
    Connected(StreamDeckListSerial),
    Available(Vec<ListDeckInfo>),
}

#[tauri::command]
fn get_streamdecks(state: tauri::State<SharedState>) -> anyhow_tauri::TAResult<StreamDeckList> {
    let mgr = state.lock().unwrap();

    let api = HidApi::new().unwrap();
    let devices: Vec<ListDeckInfo> = api
        .device_list()
        .filter(|dev| dev.vendor_id() == ELGATO_VID)
        .map(|dev| ListDeckInfo {
            vid: dev.vendor_id(),
            pid: dev.product_id(),
            serial: dev.serial_number().map(|s| s.to_string()),
            product: dev.product_string().map(|s| s.to_string()),
        })
        .collect();

    if let Some(current) = &mgr.current {
        let serial = current.serial.clone();
        return Ok(StreamDeckList::Connected(StreamDeckListSerial {
            serial,
            list: devices,
        }));
    }

    Ok(StreamDeckList::Available(devices))
}

#[derive(serde::Deserialize)]
struct DeckSelect {
    vid: u16,
    pid: u16,
    serial: String,
}

#[tauri::command]
fn open_streamdeck(
    streamdeck: DeckSelect,
    state: tauri::State<SharedState>,
) -> anyhow_tauri::TAResult<DeckInfo> {
    let mut mgr = state.lock().unwrap();

    if let Some(current) = &mgr.current {
        let info = current.deck_info.clone();
        return Ok(info);
    }

    let deck = streamdeck::StreamDeck::connect(
        streamdeck.vid,
        streamdeck.pid,
        Some(streamdeck.serial.clone()),
    )
    .into_ta_result()?;

    let kind = deck.kind();
    let handle = DeckHandle {
        deck,
        serial: streamdeck.serial,
        deck_info: DeckInfo {
            kind: match kind {
                Kind::Mini => "Mini".to_string(),
                Kind::Original => "Original".to_string(),
                Kind::OriginalV2 => "Original V2".to_string(),
                Kind::Xl => "XL".to_string(),
                Kind::Mk2 => "MK2".to_string(),
            },
            keys: kind.keys(),
            image_size: kind.image_size(),
        },
    };

    let info = handle.deck_info.clone();

    mgr.current = Some(handle);

    Ok(info)
}

#[tauri::command]
fn set_brightness(
    brightness: u8,
    state: tauri::State<SharedState>,
) -> anyhow_tauri::TAResult<bool> {
    let mut mgr = state.lock().unwrap();
    if let Some(handle) = &mut mgr.current {
        handle.deck.set_brightness(brightness).into_ta_result()?;
        return Ok(true);
    }

    return Ok(false);
}

#[tauri::command]
fn close_streamdeck(state: tauri::State<SharedState>) -> bool {
    let mut mgr = state.lock().unwrap();
    if let Some(_) = mgr.current {
        mgr.current = None;
        return true;
    }

    return false;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state: SharedState = Arc::new(Mutex::new(DeckManager::default()));

    tauri::Builder::default()
        .manage(state)
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_streamdecks,
            open_streamdeck,
            close_streamdeck,
            set_brightness
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
