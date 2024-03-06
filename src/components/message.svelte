<script lang="ts">
    import { twMerge } from 'tailwind-merge'
    export let center = false

    let cls = ''
    export { cls as class }
</script>

<h1 class={twMerge('mx-auto w-max text-xl text-text', center ? 'my-auto' : '', cls)}><slot /></h1>
