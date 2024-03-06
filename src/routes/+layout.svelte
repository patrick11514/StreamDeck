<script lang="ts">
    import { API } from '$lib/client'
    import '../app.css'
    import type { LayoutServerData } from './$types'

    export let data: LayoutServerData
    API.hydrateFromServer(data.api)
</script>

<div class="bg-background h-full min-h-screen w-full">
    <slot />
</div>
