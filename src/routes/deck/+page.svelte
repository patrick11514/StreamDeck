<script lang="ts">
  import Button from '$/lib/components/ui/button/button.svelte';
  import * as Card from '$/lib/components/ui/card';
  import * as DropdownMenu from '$/lib/components/ui/dropdown-menu';
  import Slider from '$/lib/components/ui/slider/slider.svelte';
  import { deckSelect, getCurrentInstance } from '$/lib/store.svelte';
  import { goto } from '$app/navigation';
  import { ChevronDown, ImageIcon, Loader, Sun } from '@lucide/svelte';
  import Cropper from 'svelte-easy-crop';

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

  let selectedTile = $state<[number, number] | null>(null);
  const isSelected = (row: number, col: number) =>
    selectedTile && selectedTile[0] === row && selectedTile[1] === col;

  type KeyData = string;
  let keys = $state<KeyData[]>([]);
  const getKey = (row: number, col: number) => {
    const index = row * col;
    if (keys[index]) {
      return keys[index];
    }
    return null;
  };

  /*const handleUpload = async (file: File) => {
    if (!file) return;
    if (!selectedTile) return;

    /*console.log(
      await invoke('send_image', { image: new Uint8Array(await file.arrayBuffer()) })
    );*/
  /*console.log('SENDING');
  };*/

  let input = $state() as HTMLInputElement;
  let inputValue = $state<FileList | null | undefined>(null);
  $effect(() => {
    if (inputValue) {
      const file = Array.from(inputValue).filter((file) => file)[0];
      if (!file) return;

      imagePath = {
        file,
        blob: URL.createObjectURL(file)
      };
    }
  });

  let imagePath = $state<{
    file: File;
    blob: string;
  } | null>(null);
</script>

{#if deck && deck.connected && deck.deckInfo}
  {@const layout = deck.getButtonLayout()}
  <input
    bind:this={input}
    type="file"
    class="hidden"
    bind:files={inputValue}
    accept="image/*"
  />
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
                <Button
                  onclick={() => {
                    if (isSelected(row, col)) {
                      selectedTile = null;
                      return;
                    }
                    selectedTile = [row, col];
                  }}
                  class={[
                    'aspect-square h-auto w-26 border border-transparent',
                    isSelected(row, col) ? 'border-white' : undefined
                  ]}
                  variant="secondary"
                >
                  <Card.Content>{row}x{col}</Card.Content>
                </Button>
              {/each}
            </div>
          {/each}
        </div>
        <div>BUTTOMS</div>
      </div>
      <div class="flex flex-1/2 items-center justify-center">
        {#if selectedTile}
          {@const keyData = getKey(selectedTile[0], selectedTile[1])}
          <div class="flex gap-8">
            <button
              onclick={() => input.click()}
              class="flex aspect-square w-48 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-white"
            >
              {#if !keyData}
                <img
                  id="LOL"
                  alt="cat lol"
                  src="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3V0ZSUyMGNhdHxlbnwwfHwwfHx8MA%3D%3D"
                />
              {:else}
                <ImageIcon size={120} />
              {/if}
            </button>
            <div class="flex flex-col gap-2">
              <div>aaa</div>

              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
              <div>aaa</div>
            </div>
          </div>
        {:else}
          Please select a tile for configuration
        {/if}
      </div>
    </div>
    <div class="w-1/5">HERE WILL BE SEKECT</div>
  </div>

  {#if imagePath}
    {@const imageSize = deck.deckInfo.image_size}
    <div class="absolute top-0 left-0 flex h-screen w-full items-center justify-center">
      <Card.Root>
        <Card.Content>
          <Cropper
            image={imagePath.blob}
            minZoom={1}
            maxZoom={1}
            aspect={1}
            cropSize={{ width: imageSize[0], height: imageSize[1] }}
          />
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
{:else}
  <Loader class="animate-spin" />
{/if}
