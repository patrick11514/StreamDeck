<script lang="ts">
    import { API } from '$lib/client'
    import { SwalAlert, defferedWritable } from '$lib/functions'
    import type { StreamDeckProperties } from '$types/types'
    import { onMount } from 'svelte'

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
</script>

<section class="flex w-full flex-row">
    <div>
        <input min={0} max={100} type="range" bind:value={$brightness} />
        {$brightness}
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
            </tbody>
        </table>
    </div>
</section>
