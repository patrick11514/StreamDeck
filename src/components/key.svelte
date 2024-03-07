<script lang="ts">
    import { API } from '$/lib/client'
    import { SwalAlert } from '$/lib/functions'
    import { onMount } from 'svelte'
    import FileInput from './fileInput.svelte'

    export let id: number
    export let size: number
    let image: string | undefined = undefined

    onMount(async () => {
        const data = await API.deck.key.POST(id)

        if (data.status) {
            image = data.data
        }
    })

    const onDrop = async (file: (File | null)[]) => {
        const realFiles = file.filter((f) => f !== null) as File[]

        if (realFiles.length == 0 || realFiles.length > 1) {
            return
        }

        const formData = new FormData()
        formData.append('image', realFiles[0])
        formData.append('key', id.toString())

        const data = await API.upload(formData)

        if (!data.status) {
            SwalAlert({
                icon: 'error',
                title: 'Unable to upload image'
            })
            return
        }

        image = data.data + '?' + Date.now()
    }
</script>

<FileInput class="flex aspect-square w-[5vw] min-w-[80px] items-center justify-center rounded-md border-2 border-black" {onDrop}>
    {#if !image}
        {id}
    {:else}
        <img style="width:{size}px;height:{size}px;" src={image} alt="Key preview" />
    {/if}
</FileInput>
