<script lang="ts">
	import UIItem from "$lib/Item.svelte";
	import type { Item } from "@theatrex/types";

	export let data: { item: Item<true> };
</script>

<svelte:head>
	<title>{data.item.name} | TheatreX</title>
	<meta name="description" content={data.item.description} />
</svelte:head>

<section>
	<div class="p-2">
		<UIItem item={data.item} />
	</div>
</section>
