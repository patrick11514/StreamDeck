<script lang="ts">
    import { API } from '$lib/client'
    import { onMount } from 'svelte'

    onMount(async () => {
        const data = await API.deck.device.GET()

        console.log(data)
    })
</script>

<section class="flex">
    <input type="" />
</section>
