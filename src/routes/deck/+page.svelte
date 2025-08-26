<script lang="ts">
  import * as Card from '$/lib/components/ui/card';
  import { getCurrentInstance } from '$/lib/store.svelte';
  import { goto } from '$app/navigation';
  import { Loader } from '@lucide/svelte';

  const deck = getCurrentInstance();

  if (!deck) {
    goto('/');
  }
</script>

{#if deck && deck.connected}
  {@const layout = deck.getButtonLayout()}
  <div class="flex flex-col gap-2">
    {#each Array.from({ length: layout[0] }) as _row, row (row)}
      <div class="flex flex-row gap-2">
        {#each Array.from({ length: layout[1] }) as _col, col (`${row}x${col}`)}
          <Card.Root>
            <Card.Content>{row}x{col}</Card.Content>
          </Card.Root>
        {/each}
      </div>
    {/each}
  </div>
{:else}
  <Loader class="animate-spin" />
{/if}
