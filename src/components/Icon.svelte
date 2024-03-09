<script lang="ts">
    import type { BootstrapIcon } from '$/types/bootstrap_icons';
    import { twMerge } from 'tailwind-merge';
    let cls = '';
    export { cls as class };
    export let name: BootstrapIcon;
</script>

<i class={twMerge('bi', name, cls)}><slot /></i>
