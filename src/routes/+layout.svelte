<script lang="ts">
  import { Toaster } from '$/lib/components/ui/sonner';
  import '../app.css';
  import '../fonts.css';

  import { deckSelect } from '$/lib/store.svelte';
  import { onMount } from 'svelte';
  import type { LayoutProps } from './$types';

  const { children }: LayoutProps = $props();

  onMount(deckSelect.fetchDecks);
</script>

<Toaster />

<main
  class="font-loto bg-background text-foreground dark flex h-full min-h-screen w-full flex-col items-center justify-center gap-2 overflow-x-hidden"
>
  {@render children()}
</main>
