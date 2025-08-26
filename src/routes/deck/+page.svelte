<script lang="ts">
  import Button from '$/lib/components/ui/button/button.svelte';
  import * as Card from '$/lib/components/ui/card';
  import * as DropdownMenu from '$/lib/components/ui/dropdown-menu';
  import { deckSelect, getCurrentInstance } from '$/lib/store.svelte';
  import { goto } from '$app/navigation';
  import { ChevronDown, Loader } from '@lucide/svelte';

  const deck = getCurrentInstance();

  if (!deck) {
    goto('/');
  }
</script>

{#if deck && deck.connected && deck.deckInfo}
  {@const layout = deck.getButtonLayout()}

  <div class="divide-border flex w-full flex-1 flex-row gap-4 divide-x-2 p-8">
    <div class="divide-border flex flex-1 flex-col gap-2 divide-y-2">
      <div class="flex flex-1/2 flex-col gap-2">
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger class="cursor-pointer font-bold">
              {#snippet child({ props })}
                <Button variant="secondary" {...props}>
                  {deck.selectedDeck.product}
                  <ChevronDown />
                </Button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Group>
                <DropdownMenu.Label>{deck.selectedDeck.serial}</DropdownMenu.Label>
                <DropdownMenu.Item>
                  {#snippet child({ props })}
                    <Button
                      {...props}
                      variant="destructive"
                      class="w-full"
                      onclick={() => {
                        deckSelect.selected = undefined;
                        deck.disconnect().then(() => goto('/'));
                      }}
                    >
                      Disconnect
                    </Button>
                  {/snippet}
                </DropdownMenu.Item>
              </DropdownMenu.Group>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div class="mx-auto flex flex-col gap-2">
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
        <div>BUTTOMS</div>
      </div>
      <div class="flex-1/2">MORE INFO</div>
    </div>
    <div class="w-1/5">HERE WILL BE SEKECT</div>
  </div>
{:else}
  <Loader class="animate-spin" />
{/if}
