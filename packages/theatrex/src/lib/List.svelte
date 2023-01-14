<script lang="ts">
	import { fade } from "svelte/transition";
	import type { ListItem } from "@theatrex/types";
	import UIListItem from "./ListItem.svelte";

	export let items: ListItem[];
	export let name: string = "";
</script>

<div class="w-full p-2">
	{#if name}
		<h2 class="mb-2">
			{name}
		</h2>
	{/if}
	<div class="carousel rounded-box">
		{#each items as item, idx}
			<div class="carousel-item" in:fade={{ duration: 210, delay: idx * 70 }}>
				<UIListItem {item} />
			</div>
		{/each}
	</div>
</div>
