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
  private deckInfo: DeckInfo | null = null;
  private connected = false;

  constructor(private selectedDeck: DeckListItem) {}

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
}
