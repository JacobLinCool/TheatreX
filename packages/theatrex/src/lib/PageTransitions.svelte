<script>
	import { fade } from "svelte/transition";
</script>

<div class="contents" in:fade={{ duration: 100 }}>
	<slot />
</div>
