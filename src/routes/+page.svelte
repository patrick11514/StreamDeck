<script lang="ts">
  import Button from '$/lib/components/ui/button/button.svelte';
  import * as Select from '$/lib/components/ui/select';
  import { deckSelect, getCurrentInstance, setCurrentInstance } from '$/lib/store.svelte';
  import { StreamDeck, type DeckListItem } from '$/lib/StreamDeck/main.svelte';
  import { goto } from '$app/navigation';
  import { Loader, RotateCcw } from '@lucide/svelte/icons';

  const deckToString = (deck: DeckListItem) => {
    return `${deck.product} (${deck.serial})`;
  };

  const setStreamdeck = () => {
    const found = deckSelect.list!.find((d) => d.serial === deckSelect.selected);
    if (!found) return;

    const streamdeck = new StreamDeck(found);

    setCurrentInstance(streamdeck);

    streamdeck.connect();
  };

  $effect(() => {
    if (deckSelect.selected) {
      setStreamdeck();
    }
  });

  let instance = $derived(getCurrentInstance());

  $effect(() => {
    if (instance && instance.connected) {
      goto('/deck');
    }
  });
</script>

{#if !deckSelect.list || deckSelect.selected}
  <Loader class="animate-spin" />
{:else}
  <section class="flex flex-row gap-2">
    <Select.Root type="single" bind:value={deckSelect.selected}>
      <Select.Trigger>
        {deckSelect.selected
          ? deckToString(deckSelect.list.find((d) => d.serial === deckSelect.selected)!)
          : 'Select Deck to connect'}
      </Select.Trigger>
      <Select.Content>
        {#each deckSelect.list as deck (deck.serial)}
          <Select.Item value={deck.serial}>
            {deckToString(deck)}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    <Button variant="outline" onclick={deckSelect.fetchDecks}><RotateCcw /></Button>
  </section>
{/if}
