<script lang="ts">
    import { browser } from '$app/environment'
    import { API } from '$lib/client'
    import { SwalAlert } from '$lib/functions'
    import type { StreamDeckProperties } from '$types/types'
    import type { StreamDeckDeviceInfo } from '@elgato-stream-deck/node/dist/device'
    import { onMount } from 'svelte'
    import Button from '../components/button.svelte'
    import Message from '../components/message.svelte'
    import Select from '../components/select.svelte'
    import StreamdeckUi from '../components/streamdeckUI.svelte'
    import type { PageServerData } from './$types'

    export let data: PageServerData

    let devices: undefined | StreamDeckDeviceInfo[] = undefined

    onMount(async () => {
        const data = await API.deck.device.GET()

        resolveData(data)
    })

    let selected = ''
    let deviceData: StreamDeckProperties | undefined = undefined
    let disabled = false
    let skip = false

    const resolveData = (response: (typeof data)['devices']) => {
        devices = response.data.devices

        if (response.data.connected) {
            deviceData = response.data.data
            const serial = response.data.data.serial
            skip = true
            selected = response.data.devices.find((device) => device.serialNumber === serial)?.path ?? ''
        }
    }

    resolveData(data.devices)

    const selectDevice = async (path: string) => {
        if (!path) return
        if (skip) {
            skip = false
            return
        }

        const data = await API.deck.device.PUT(path)

        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: data.message
            })
            selected = ''
            return
        }

        deviceData = data.data
    }

    $: if (browser) selectDevice(selected)

    const disconnect = async () => {
        disabled = true
        const data = await API.deck.device.DELETE(null)
        disabled = false

        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: data.message
            })
            return
        }

        deviceData = undefined
        selected = ''
    }
</script>

<svelte:head>
    <title>{!deviceData ? 'No device connected' : `${deviceData.name} (${deviceData.serial})`}</title>
</svelte:head>

<section class="flex flex-col p-4">
    {#if devices === undefined}
        <Message>Načítání</Message>
    {:else}
        <div>
            <Select bind:value={selected}>
                {#if devices.length == 0}
                    <option disabled value="" selected>Žádné zařízení nebylo nenalezeno</option>
                {:else}
                    {#each devices as device}
                        <option value={device.path}>StreamDeck ({device.model}){device.serialNumber ? ` - ${device.serialNumber}` : ''}</option>
                    {/each}
                {/if}
            </Select>
            {#if deviceData}
                <Button {disabled} on:click={disconnect} class="bg-red-600 hover:bg-red-700">Disconnect</Button>
            {/if}
        </div>

        {#if deviceData}
            <StreamdeckUi data={deviceData} />
        {/if}
    {/if}
</section>
