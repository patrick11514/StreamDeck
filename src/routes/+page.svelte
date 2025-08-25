<script lang="ts">
    import Button from "$/lib/components/ui/button/button.svelte"
    import * as Select from "$/lib/components/ui/select"
    import { invoke } from "@tauri-apps/api/core"
    import { onMount } from "svelte"

    type Deck = {
        vid: number
        pid: number
        serial: string
        product: string
    }

    let decks = $state() as Promise<Deck[]>
    let selected_deck = $state<string>()

    onMount(() => {
        decks = invoke("get_streamdecks")
    })

    const deckToString = (deck: Deck) => {
        return `${deck.product} (${deck.serial})`
    }
</script>

{#await decks}
    LOADING
{:then _decks}
    <Select.Root type="single" bind:value={selected_deck}>
        <Select.Trigger>
            {selected_deck
                ? deckToString(_decks.find((d) => d.serial === selected_deck)!)
                : "Select Deck"}
        </Select.Trigger>
        <Select.Content>
            {#each _decks as deck}
                <Select.Item value={deck.serial}>
                    {deckToString(deck)}
                </Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
    <Button disabled={!selected_deck} onclick={console.log}>Continue</Button>
{/await}
