<script lang="ts">
  import { getCurrentInstance } from '$/lib/store.svelte';
  import { goto } from '$app/navigation';

  const deck = getCurrentInstance();

  if (!deck) {
    goto('/');
  }
</script>

PRDEL
