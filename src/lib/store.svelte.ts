import { invoke } from '@tauri-apps/api/core';
import { type DeckListItem, type StreamDeck } from './StreamDeck/main.svelte';
import { toastError } from './utils';

let currentInstance = $state<StreamDeck>();

export const setCurrentInstance = (instance: StreamDeck) => {
  currentInstance = instance;
};

export const getCurrentInstance = () => {
  return currentInstance;
};

export const deckSelect = $state({
  list: undefined as DeckListItem[] | undefined,
  selected: undefined as string | undefined,
  fetchDecks: async () => {
    try {
      const result = await invoke<
        | {
            Available: DeckListItem[];
          }
        | {
            Connected: {
              serial: string;
              list: DeckListItem[];
            };
          }
      >('get_streamdecks');

      if ('Connected' in result) {
        deckSelect.list = result.Connected.list;
        deckSelect.selected = result.Connected.serial;
        return;
      }
      deckSelect.list = result.Available;

      if (deckSelect.list.length === 0) {
        toastError('No StreamDecks connected, please connect one and hit reload button.');
      } else if (deckSelect.list.length === 1) {
        deckSelect.selected = deckSelect.list[0].serial;
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to get connected StreamDeck, please try again.');
    }
  }
});
