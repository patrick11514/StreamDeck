<script lang="ts">
    import { API } from '$lib/client'
    import { onMount } from 'svelte'

    onMount(async () => {
        console.log(await API.example())
    })
</script>

<h1>Welcome to SvelteKit</h1>
<p>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
    <span class="text-red-500">text-red-500</span>
</p>
