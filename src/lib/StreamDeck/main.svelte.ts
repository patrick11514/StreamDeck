import { invoke } from '@tauri-apps/api/core';
import { toastSuccess } from '../utils';

export type DeckListItem = {
  vid: number;
  pid: number;
  serial: string;
  product: string;
};

export type DeckInfo = {
  kind: 'Mini' | 'Original' | 'Original V2' | 'XL' | 'MK2';
  keys: number;
  image_size: [number, number];
};

export class StreamDeck {
  public deckInfo: DeckInfo | null = null;
  public connected = $state(false);

  constructor(public readonly selectedDeck: DeckListItem) {}

  //Method to connect to selected streamdeck via HIDAPI through Tauri
  async connect() {
    try {
      this.deckInfo = await invoke<DeckInfo>('open_streamdeck', {
        streamdeck: {
          vid: this.selectedDeck.vid,
          pid: this.selectedDeck.pid,
          serial: this.selectedDeck.serial
        }
      });

      this.connected = true;

      toastSuccess(
        `Successfully connected to StreamDeck ${this.deckInfo.kind} (${this.selectedDeck.serial})`
      );
    } catch (e) {
      this.connected = false;
      console.error(e);
    }
  }

  getButtonLayout() {
    if (!this.deckInfo) return [0, 0];
    switch (this.deckInfo.kind) {
      case 'Mini':
        return [2, 3];
      case 'MK2':
      case 'Original':
      case 'Original V2':
        return [3, 5];
      case 'XL':
        return [4, 8];
    }
  }

  async disconnect() {
    try {
      await invoke('close_streamdeck');
      this.connected = false;
      toastSuccess(
        `Successfully disconnected from StreamDeck (${this.selectedDeck.serial})`
      );
    } catch (e) {
      console.error(e);
    }
  }

  async getBrightness() {
    if (!this.connected) return 100;

    const brightness = await invoke<number>('get_brightness');
    return brightness;
  }

  async setBrightness(brightness: number) {
    if (!this.connected) return false;

    await invoke('set_brightness', { brightness });

    toastSuccess(`Set brightness to ${brightness}%`);
    return true;
  }
}
