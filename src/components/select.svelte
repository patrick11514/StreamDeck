<script lang="ts">
    import { twMerge } from 'tailwind-merge'

    export let name = ''
    export let id = ''

    let cls = ''
    export { cls as class }

    export let value = ''
</script>

<select class={twMerge(' font-ubuntu w-max rounded-lg px-4 py-1 text-lg', cls)} {name} {id} bind:value><slot /></select>
