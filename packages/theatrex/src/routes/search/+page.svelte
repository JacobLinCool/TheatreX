<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Grid from "$lib/Grid.svelte";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { SearchResult } from "@theatrex/types";

	let target = $page.url.searchParams.get("q") || "";
	let query = target;

	let results: {
		name: string;
		items: SearchResult[];
	}[] = [];

	async function search(evt: KeyboardEvent) {
		if (evt.key === "Enter") {
			goto(`/search?q=${query}`);

			if (target !== query) {
				target = query;
				run();
			}
		}
	}

	let searching = 0;
	async function run() {
		if (!target) {
			return;
		}
		const interval = setInterval(() => {
			searching = Math.min(searching + 2, 100);
		}, 100);
		results = [];
		const data = await fetch(`/api/search?q=${target}`);
		const json = await data.json();
		clearInterval(interval);
		searching = 0;
		results = json;
	}

	onMount(() => {
		run();
	});
</script>

<svelte:head>
	<title>Search: {target} | TheatreX</title>
	<meta name="description" content="Search: {target} | TheatreX" />
</svelte:head>

<section>
	<div class="flex w-full items-center p-2">
		<div class="form-control w-full">
			<label class="label" for="search">
				<span class="label-text">Search</span>
			</label>
			<input
				id="search"
				type="text"
				placeholder="Type to search"
				class="input text-base-content border-base-100 hover:border-accent-focus focus:border-accent w-full border focus:outline-none"
				bind:value={query}
				on:keypress={search}
			/>
		</div>
	</div>

	{#if target && searching === 0}
		<div class="w-full p-2" in:fade={{ duration: 50, delay: 50 }} out:fade={{ duration: 50 }}>
			<p class="text-base-content text-2xl">
				{#if results.reduce((acc, cur) => acc + cur.items.length, 0) === 0}
					No results found for "{target}"
				{:else}
					Results for "{target}"
				{/if}
			</p>

			{#each results as result}
				{#if result.items.length > 0}
					<Grid items={result.items} name={result.name} />
				{/if}
			{/each}
		</div>
	{/if}

	{#if searching !== 0}
		<div class="w-full p-2">
			<progress
				class="progress progress-info animate-pulse transition-all duration-[5000ms] {searching >
				2
					? 'w-full'
					: 'w-0'}"
				value="100"
				max="100"
				in:fade={{ duration: 50, delay: 50 }}
				out:fade={{ duration: 50 }}
			/>
		</div>
	{/if}
</section>
