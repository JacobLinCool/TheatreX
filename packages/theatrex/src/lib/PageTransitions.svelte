<script>
	import { fade } from "svelte/transition";
</script>

<div in:fade={{ duration: 100 }}>
	<slot />
</div>
