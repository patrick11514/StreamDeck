<script lang="ts">
    import { API } from '$/lib/client'
    import { onMount } from 'svelte'

    export let id: number
    let image: string | undefined = undefined

    onMount(async () => {
        const data = await API.deck.key.icon(id)

        if (data.status) {
            image = data.data
        }
    })
</script>

<button
    style={image !== undefined ? `background-image: url(${image})` : ''}
    class="flex aspect-square w-[5vw] min-w-[80px] items-stretch justify-stretch rounded-md bg-black bg-cover bg-no-repeat"
    on:click
/>
