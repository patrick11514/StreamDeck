<script lang="ts">
    import type { KeyInfo, StreamDeckProperties } from '$/types/types'
    import { API } from '$lib/client'
    import { SwalAlert, defferedWritable } from '$lib/functions'
    import { onMount } from 'svelte'
    import Key from './key.svelte'

    export let data: StreamDeckProperties

    const updateBrightness = async (brightness: number) => {
        if (!initialized) return

        const data = await API.deck.brightness(brightness)

        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: 'Unable to set brightness'
            })
            return
        }
    }

    let initialized = false
    let brightness = defferedWritable(0, updateBrightness, 500)

    onMount(async () => {
        const response = await API.deck.device.POST(data.serial)

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            })
            return
        }

        $brightness = response.data.brightness

        initialized = true
    })

    let currentKeyData: undefined | null | KeyInfo = undefined

    const selectKey = async (key: number) => {
        const data = await API.deck.key.info(key)

        if (!data.status) {
            currentKeyData = null
            return
        }

        currentKeyData = data.data
    }
</script>

<section class="flex w-full flex-row">
    <div class="flex flex-col">
        <div>
            <h2 class="font-poppins text-xl font-medium">Brightness</h2>
            <div class="flex flex-row items-center gap-4">
                <input min={0} max={100} type="range" bind:value={$brightness} />
                <span class="font-medium">{$brightness}%</span>
            </div>
        </div>
        <div class="flex flex-col gap-2 p-2">
            {#each Array.from({ length: data.rows }) as _, i}
                <div class="flex flex-row gap-2">
                    {#each Array.from({ length: data.cols }) as _, j}
                        <Key on:click={() => selectKey(i * data.cols + j)} id={i * data.cols + j} />
                    {/each}
                </div>
            {/each}
        </div>
        {#if currentKeyData !== undefined}
            <div>{JSON.stringify(currentKeyData)}</div>
        {/if}
    </div>
    <div class="ml-auto">
        <h2 class="mx-auto w-max border-b-4 border-b-text font-poppins text-2xl font-medium">StreamDeck info</h2>
        <table>
            <tbody>
                <tr class="text-xl font-medium">
                    <td>Firmware version:</td>
                    <td class="pl-2 font-normal">{data.firmware}</td>
                </tr>
                <tr class="text-xl font-medium">
                    <td>Serial number:</td>
                    <td class="pl-2 font-normal">{data.serial}</td>
                </tr>
                <tr class="text-xl font-medium">
                    <td>Icon size:</td>
                    <td class="pl-2 font-normal">{data.iconSize} px</td>
                </tr>
            </tbody>
        </table>
    </div>
</section>
