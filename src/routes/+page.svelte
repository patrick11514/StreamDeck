<script lang="ts">
    import { API } from '$lib/client'
    import type { StreamDeckDeviceInfo } from '@elgato-stream-deck/node/dist/device'
    import { onMount } from 'svelte'
    import Message from '../components/message.svelte'
    import Select from '../components/select.svelte'
    import type { PageServerData } from './$types'

    export let data: PageServerData

    let devices: undefined | StreamDeckDeviceInfo[] = undefined

    const resolveData = (response: (typeof data)['devices']) => {
        devices = response.data
    }

    resolveData(data.devices)

    onMount(async () => {
        const data = await API.deck.device.GET()

        resolveData(data)
    })

    let selected = ''

    $: console.log(selected)
</script>

<section class="flex flex-col p-4">
    {#if devices === undefined}
        <Message>Načítání</Message>
    {:else}
        <Select bind:value={selected}>
            {#if devices.length == 0}
                <option disabled value="" selected>Žádné zařízení nebylo nenalezeno</option>
            {:else}
                {#each devices as device}
                    <option value={device.path}>{device.model}</option>
                {/each}
            {/if}
        </Select>
    {/if}
</section>
