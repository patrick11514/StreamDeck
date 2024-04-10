<script lang="ts">
    import type { Actions } from '$/lib/server/_app/deck/action'
    import type { KeyInfo, StreamDeckProperties } from '$/types/types'
    import { API } from '$lib/client'
    import { SwalAlert, defferedWritable } from '$lib/functions'
    import { onMount } from 'svelte'
    import Icon from './Icon.svelte'
    import FileInput from './fileInput.svelte'
    import Key from './key.svelte'
    import Select from './select.svelte'

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

    let actionsNames: Record<Actions[number], string> | undefined = undefined
    let actions = [] as unknown as Actions

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

        const response2 = await API.deck.action.GET()

        if (!response2.status) {
            SwalAlert({
                icon: 'error',
                title: response2.message
            })
            return
        }

        actions = response2.data.actions
        actionsNames = response2.data.names

        initialized = true
    })

    let currentKey: undefined | number = undefined
    let currentKeyData: undefined | null | KeyInfo = undefined

    const selectKey = async (key: number) => {
        const data = await API.deck.key.info(key)

        currentKey = key

        if (!data.status) {
            currentKeyData = null
            selectedAction = undefined
            return
        }

        currentKeyData = data.data
        selectedAction = data.data?.action
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

    let selectedAction: Actions[number] | undefined = undefined

    const updateAction = async (selectedAction: Actions[number] | undefined) => {
        if (!selectedAction || currentKey === undefined) {
            return
        }

        const response = await API.deck.action.POST({
            key: currentKey,
            action: selectedAction
        })

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            })
            return
        }

        selectKey(currentKey)
    }

    $: updateAction(selectedAction)

    const removeAction = async () => {
        if (currentKey === undefined) {
            return
        }

        const response = await API.deck.action.DELETE(currentKey)

        if (!response.status) {
            SwalAlert({
                icon: 'error',
                title: response.message
            })
            return
        }

        selectedAction = undefined
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
            <h2 class="font-poppins text-lg font-medium">Selected key {currentKey}:</h2>
            <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                    <FileInput
                        class="rounded-lg bg-primary px-2 py-1 text-center font-poppins text-lg font-medium text-white transition-colors duration-200 hover:bg-secondary"
                        {onDrop}
                    >
                        {currentKeyData?.icon === true ? 'Change icon' : 'Set icon'}
                    </FileInput>
                    {#if currentKeyData?.icon === true}
                        <button title="Remove icon" on:click={removeIcon} class="rounded-lg bg-red-500 px-2.5 py-1 transition-colors duration-200 hover:bg-red-600">
                            <Icon class="text-white" name="bi-trash-fill" />
                        </button>
                    {/if}
                </div>
                <div class="flex flex-col gap-2">
                    {#if actionsNames !== undefined}
                        <h2 class="font-ubuntu text-lg font-bold">Select action</h2>
                        <div class="flex flex-row gap-2">
                            <Select bind:value={selectedAction}>
                                {#each actions as action}
                                    <option value={action}>{actionsNames[action]}</option>
                                {/each}
                            </Select>
                            {#if selectedAction !== undefined}
                                <button title="Remove action" on:click={removeAction} class="rounded-lg bg-red-500 px-2.5 py-1 transition-colors duration-200 hover:bg-red-600">
                                    <Icon class="text-white" name="bi-trash-fill" />
                                </button>
                            {/if}
                        </div>
                    {/if}
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
