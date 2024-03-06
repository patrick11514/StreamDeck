<script lang="ts">
    import { API } from '$lib/client'
    import { onMount } from 'svelte'

    onMount(async () => {
        console.log(await API.example())
    })
</script>

<section class="flex">
    <input type="" />
</section>
