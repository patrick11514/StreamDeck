<script lang="ts">
    export let image: string | undefined = undefined
</script>

<button
    style={image !== undefined ? `background-image: url(${image})` : ''}
    class="flex aspect-square w-[5vw] min-w-[80px] items-stretch justify-stretch rounded-md bg-black bg-cover bg-no-repeat"
    on:click
/>
