use std::collections::HashMap;

#[derive(serde::Deserialize, serde::Serialize, Clone)]
pub struct Config {
    pub brightness: u8,
}

pub type MultiDeviceConfig = HashMap<String, Config>;

impl Default for Config {
    fn default() -> Self {
        Self { brightness: 100 }
    }
}

pub fn get_config_dir() -> Option<std::path::PathBuf> {
    if let Some(dir) = dirs::config_dir() {
        Some(dir.join("cz.patrick115.streamdeck"))
    } else {
        None
    }
}

pub fn read_config() -> anyhow::Result<MultiDeviceConfig> {
    let config_path = get_config_dir()
        .ok_or_else(|| anyhow::anyhow!("Could not determine config directory"))?
        .join("config.toml");
    if config_path.exists() {
        let data = std::fs::read_to_string(config_path)?;
        let config: MultiDeviceConfig = toml::from_str(&data)?;
        Ok(config)
    } else {
        Ok(MultiDeviceConfig::new())
    }
}

pub fn write_config(config: &MultiDeviceConfig) -> anyhow::Result<()> {
    let config_dir =
        get_config_dir().ok_or_else(|| anyhow::anyhow!("Could not determine config directory"))?;
    std::fs::create_dir_all(&config_dir)?;
    let config_path = config_dir.join("config.toml");
    let data = toml::to_string_pretty(config)?;
    std::fs::write(config_path, data)?;
    Ok(())
}
