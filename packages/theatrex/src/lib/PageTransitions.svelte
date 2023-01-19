<script>
	import { page } from "$app/stores";
	import { afterNavigate, beforeNavigate } from "$app/navigation";
	import { fade } from "svelte/transition";

	let show_content = true;
	beforeNavigate(() => (show_content = false));
	afterNavigate(() => (show_content = true));
</script>

{#key $page.url.pathname}
	{#if show_content}
		<div in:fade={{ duration: 150, delay: 100 }} out:fade={{ duration: 100 }}>
			<slot />
		</div>
	{/if}
{/key}
