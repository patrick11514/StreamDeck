use std::{
    mem,
    sync::{Arc, Mutex},
};

use anyhow_tauri::IntoTAResult;
use hidapi::HidApi;
use streamdeck::Kind;

use crate::config::{self, MultiDeviceConfig};

#[derive(Clone, serde::Serialize)]
pub struct DeckInfo {
    kind: String,
    keys: u8,
    image_size: (usize, usize),
}

pub struct DeckHandle {
    serial: String,
    deck: streamdeck::StreamDeck,
    deck_info: DeckInfo,
}

pub struct ConnectedDeck {
    pub all_config: config::MultiDeviceConfig,
    pub current: DeckHandle,
}

impl ConnectedDeck {
    pub fn config(&self) -> Option<&config::Config> {
        self.all_config.get(&self.current.serial)
    }

    pub fn config_mut(&mut self) -> &mut config::Config {
        self.all_config
            .entry(self.current.serial.clone())
            .or_insert_with(config::Config::default)
    }
}

pub struct NotConnectedDeck {
    pub all_config: config::MultiDeviceConfig,
}

pub enum DeckManager {
    Connected(ConnectedDeck),
    NotConnected(NotConnectedDeck),
}

impl DeckManager {
    fn all_config_mut(&mut self) -> &mut MultiDeviceConfig {
        match self {
            DeckManager::Connected(c) => &mut c.all_config,
            DeckManager::NotConnected(n) => &mut n.all_config,
        }
    }

    pub fn connect(&mut self, handle: DeckHandle) {
        let all = mem::take(self.all_config_mut());
        *self = DeckManager::Connected(ConnectedDeck {
            all_config: all,
            current: handle,
        });
    }

    pub fn disconnect(&mut self) {
        let all = mem::take(self.all_config_mut());
        *self = DeckManager::NotConnected(NotConnectedDeck { all_config: all });
    }
}

impl DeckManager {
    pub fn default() -> Self {
        let config = config::read_config().unwrap_or_default();
        DeckManager::NotConnected(NotConnectedDeck { all_config: config })
    }
}

pub type SharedState = Arc<Mutex<DeckManager>>;

const ELGATO_VID: u16 = 0x0fd9;

#[derive(serde::Serialize)]
pub struct ListDeckInfo {
    vid: u16,
    pid: u16,
    serial: Option<String>,
    product: Option<String>,
}

#[derive(serde::Serialize)]
pub struct StreamDeckListSerial {
    serial: String,
    list: Vec<ListDeckInfo>,
}

#[derive(serde::Serialize)]
pub enum StreamDeckList {
    Connected(StreamDeckListSerial),
    Available(Vec<ListDeckInfo>),
}

#[derive(serde::Deserialize)]
pub struct DeckSelect {
    vid: u16,
    pid: u16,
    serial: String,
}

//Commands

#[tauri::command]
pub fn get_streamdecks(state: tauri::State<SharedState>) -> anyhow_tauri::TAResult<StreamDeckList> {
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

    if let DeckManager::Connected(deck) = &*mgr {
        let serial = deck.current.serial.clone();
        return Ok(StreamDeckList::Connected(StreamDeckListSerial {
            serial,
            list: devices,
        }));
    }

    Ok(StreamDeckList::Available(devices))
}

#[tauri::command]
pub fn open_streamdeck(
    streamdeck: DeckSelect,
    state: tauri::State<SharedState>,
) -> anyhow_tauri::TAResult<DeckInfo> {
    let mut mgr = state.lock().unwrap();

    if let DeckManager::Connected(deck) = &*mgr {
        let info = deck.current.deck_info.clone();
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

    mgr.connect(handle);

    //Apply saved config to the device
    if let DeckManager::Connected(deck) = &mut *mgr {
        let config = deck.config();
        if let Some(cfg) = config {
            deck.current.deck.set_brightness(cfg.brightness).ok();
        }
    }

    Ok(info)
}

#[tauri::command]
pub fn close_streamdeck(state: tauri::State<SharedState>) -> bool {
    let mut mgr = state.lock().unwrap();
    if let DeckManager::Connected(_) = *mgr {
        mgr.disconnect();
        return true;
    }

    return false;
}

#[tauri::command]
pub fn get_brightness(state: tauri::State<SharedState>) -> anyhow_tauri::TAResult<u8> {
    let mgr = state.lock().unwrap();

    match &*mgr {
        DeckManager::Connected(deck) => Ok(deck
            .config()
            .unwrap_or(&config::Config::default())
            .brightness),
        DeckManager::NotConnected(_) => {
            Err(anyhow::anyhow!("No device connected")).into_ta_result()
        }
    }
}

#[tauri::command]
pub fn set_brightness(
    brightness: u8,
    state: tauri::State<SharedState>,
) -> anyhow_tauri::TAResult<bool> {
    let mut mgr = state.lock().unwrap();
    if let DeckManager::Connected(deck) = &mut *mgr {
        let config = deck.config_mut();
        config.brightness = brightness;

        config::write_config(&deck.all_config).into_ta_result()?;
        return Ok(true);
    }

    return Ok(false);
}
