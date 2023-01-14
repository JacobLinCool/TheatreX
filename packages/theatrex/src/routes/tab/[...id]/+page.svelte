<script lang="ts">
	import UIGrid from "$lib/Grid.svelte";
	import UIList from "$lib/List.svelte";
	import type { List } from "@theatrex/types";

	export let data: { name: string; lists: List[] };
</script>

<svelte:head>
	<title>{data.name} | TheatreX</title>
	<meta name="description" content="{data.name} | TheatreX" />
</svelte:head>

<section class="h-full w-full p-2">
	{#key data.name}
		{#if data.lists.length > 1}
			{#each data.lists as list}
				<UIList name={list.name} items={list.items} />
			{/each}
		{:else}
			{#each data.lists as list}
				<UIGrid items={list.items} />
			{/each}
		{/if}
	{/key}
</section>
