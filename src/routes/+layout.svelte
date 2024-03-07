<script lang="ts">
    import { API } from '$lib/client'
    import '../app.css'
    import type { LayoutServerData } from './$types'

    export let data: LayoutServerData
    API.hydrateFromServer(data.api)
</script>

<div class="h-full min-h-screen w-full bg-background font-ubuntu">
    <slot />
</div>
