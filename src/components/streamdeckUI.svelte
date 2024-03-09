<script lang="ts">
    import type { KeyInfo, StreamDeckProperties } from '$/types/types'
    import { API } from '$lib/client'
    import { SwalAlert, defferedWritable } from '$lib/functions'
    import { onMount } from 'svelte'
    import Icon from './Icon.svelte'
    import FileInput from './fileInput.svelte'
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
    let keyImages: (string | undefined)[] = []

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

        const keyData = await API.deck.keys()

        if (keyData.status) {
            for (const key in keyData.data) {
                keyImages[parseInt(key)] = keyData.data[key].icon ? `/images/${data.serial}/${key}.png` : undefined
            }
        }

        initialized = true
    })

    let currentKey: undefined | number = undefined
    let currentKeyData: undefined | null | KeyInfo = undefined

    const selectKey = async (key: number) => {
        const data = await API.deck.key.info(key)

        currentKey = key

        if (!data.status) {
            currentKeyData = null
            return
        }

        currentKeyData = data.data
    }

    const onDrop = async (files: (File | null)[]) => {
        if (currentKey === undefined) return

        const realFiles = files.filter((file) => file !== null) as File[]

        if (realFiles.length === 0 || realFiles.length > 1) {
            return
        }

        const file = realFiles[0]

        const formData = new FormData()
        formData.append('key', currentKey.toString())
        formData.append('image', file)

        const response = await API.upload(formData)

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            })
            return
        }

        keyImages[currentKey] = `/images/${data.serial}/${currentKey}.png` + '?' + Date.now()

        selectKey(currentKey)
    }

    const removeIcon = async () => {
        if (currentKey === undefined) return

        const data = await API.deck.key.icon.DELETE(currentKey)

        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: data.message
            })
            return
        }

        keyImages[currentKey] = undefined

        selectKey(currentKey)
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
                        <Key on:click={() => selectKey(i * data.cols + j)} image={keyImages[i * data.cols + j]} />
                    {/each}
                </div>
            {/each}
        </div>
        {#if currentKeyData !== undefined}
            {JSON.stringify(currentKeyData)}
            <h2 class="font-poppins text-lg font-medium">Key: {currentKey}</h2>
            <div class="flex flex-col">
                <div class="flex gap-2">
                    <FileInput
                        class="rounded-lg bg-primary px-2 py-1 text-center font-poppins text-lg font-medium text-white transition-colors duration-200 hover:bg-secondary"
                        {onDrop}
                    >
                        {currentKeyData?.icon === true ? 'Změnit ikonku' : 'Nastavit ikonku'}
                    </FileInput>
                    <button on:click={removeIcon} class="rounded-lg bg-red-500 px-2.5 py-1 transition-colors duration-200 hover:bg-red-600">
                        <Icon class="text-white" name="bi-trash-fill" />
                    </button>
                </div>
            </div>
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
