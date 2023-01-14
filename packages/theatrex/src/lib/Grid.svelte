<script lang="ts">
	import { fade } from "svelte/transition";
	import type { ListItem } from "@theatrex/types";
	import UIListItem from "./ListItem.svelte";

	export let items: ListItem[];
	export let name: string = "";
</script>

{#if name}
	<h2 class="m-2">
		{name}
	</h2>
{/if}
<div
	class="grid grid-cols-2 place-items-stretch gap-2 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
>
	{#each items as item, idx}
		<div in:fade={{ duration: 120, delay: idx * 40 }}>
			<UIListItem {item} />
		</div>
	{/each}
</div>
