<script lang="ts">
	import { flip } from "svelte/animate";
	import { fade } from "svelte/transition";
	import type { ListItem } from "@theatrex/types";
	import UIListItem from "./ListItem.svelte";

	export let items: ListItem[];
	export let name: string = "";
</script>

<slot name="name">
	{#if name}
		<h2 class="m-2 text-lg font-bold">
			{name}
		</h2>
	{/if}
</slot>

<div
	class="grid grid-cols-2 place-items-stretch gap-2 p-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
>
	{#each items as item, idx (item.id)}
		<div
			class="group"
			animate:flip={{ duration: 100 }}
			in:fade={{ duration: 120, delay: idx * 40 }}
		>
			<slot name="item" {item} {idx}>
				<UIListItem {item} />
			</slot>
		</div>
	{/each}
</div>
