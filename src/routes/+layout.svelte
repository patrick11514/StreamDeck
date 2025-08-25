<script lang="ts">
    import "../app.css"
    import "../fonts.css"

    import type { LayoutProps } from "./$types"

    const { children }: LayoutProps = $props()
</script>

<main
    class="min-h-screen font-loto gap-2 h-full w-full flex flex-col items-center justify-center bg-background text-foreground dark overflow-x-hidden"
>
    {@render children()}
</main>
