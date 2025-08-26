<script lang="ts">
  import Button from '$/lib/components/ui/button/button.svelte';
  import * as Card from '$/lib/components/ui/card';
  import * as DropdownMenu from '$/lib/components/ui/dropdown-menu';
  import Slider from '$/lib/components/ui/slider/slider.svelte';
  import { deckSelect, getCurrentInstance } from '$/lib/store.svelte';
  import { goto } from '$app/navigation';
  import { ChevronDown, Loader, Sun } from '@lucide/svelte';

  const deck = getCurrentInstance();

  if (!deck) {
    goto('/');
  }

  let brightness = $state((await deck?.getBrightness()) ?? 100);
  let timeout: number;

  const onBrightnessChange = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      deck?.setBrightness(brightness);
    }, 500);
  };
</script>

{#if deck && deck.connected && deck.deckInfo}
  {@const layout = deck.getButtonLayout()}

  <div class="divide-border flex w-full flex-1 flex-row gap-4 divide-x-2 p-8">
    <div class="divide-border flex flex-1 flex-col gap-2 divide-y-2">
      <div class="flex flex-1/2 flex-col gap-2">
        <div class="flex justify-between">
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
          <div
            class="bg-secondary mr-8 flex w-1/4 items-center justify-center gap-2 rounded-md px-2 py-1"
          >
            <Sun /> Brightness: <Slider
              type="single"
              min={0}
              max={100}
              bind:value={brightness}
              onValueChange={onBrightnessChange}
            />
            <span class="text-muted-foreground min-w-10">{brightness}%</span>
          </div>
        </div>
        <div class="mx-auto flex flex-col gap-2">
          {#each Array.from({ length: layout[0] }) as _row, row (row)}
            <div class="flex flex-row gap-2">
              {#each Array.from({ length: layout[1] }) as _col, col (`${row}x${col}`)}
                <Button class="aspect-square h-auto w-26" variant="secondary">
                  <Card.Content>{row}x{col}</Card.Content>
                </Button>
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
