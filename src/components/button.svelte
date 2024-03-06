<script lang="ts">
    import { twMerge } from 'tailwind-merge'

    export let type: 'submit' | 'button' = 'button'
    export let disabled = false
    let cls = ''
    export { cls as class }
</script>

<button
    on:click
    {disabled}
    class={twMerge(
        'rounded-md bg-primary px-4 py-1 text-background transition-all duration-200 hover:bg-secondary active:translate-y-0.5 disabled:cursor-not-allowed disabled:grayscale disabled:hover:bg-primary',
        cls
    )}
    {type}
>
    <slot />
</button>
