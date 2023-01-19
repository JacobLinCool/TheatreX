<script lang="ts">
	import { goto, preloadData } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Icon from "@iconify/svelte";
	import type { Tab } from "@theatrex/types";

	export let tabs: Tab[];

	let query = "";

	onMount(() => {
		for (const tab of tabs) {
			preloadData(`/tab/${tab.name}`).then(() => {
				console.log("preload", `/tab/${tab.name}`);
			});
		}
	});

	async function search(evt: KeyboardEvent) {
		if (evt.key === "Enter") {
			goto(`/search?q=${query}`);
		}
	}
</script>

<header class="navbar bg-base-200 draggable">
	<div class="flex-1">
		<a class="btn btn-ghost text-light none-draggable text-xl normal-case" href="/">TheatreX</a>

		<div class="tabs tabs-boxed none-draggable bg-transparent">
			{#each tabs as tab}
				<a
					class="tab text-light"
					href="/tab/{tab.name}"
					class:tab-active={$page.route.id === `/tab/${tab.name}`}
				>
					{tab.name}
				</a>
			{/each}
		</div>
	</div>
	<div class="none-draggable flex-none gap-2">
		{#if $page.route.id !== "/search"}
			<div class="form-control hidden md:block">
				<input
					type="text"
					placeholder="Search"
					class="input bg-base-100 text-base-content hover:border-accent-focus focus:border-accent focus:outline-none"
					bind:value={query}
					on:keypress={search}
				/>
			</div>
			<div class="block md:hidden">
				<a href="/search" class="btn btn-ghost">
					<Icon icon="mdi:magnify" class="text-base-content text-xl" />
				</a>
			</div>
		{/if}
	</div>
</header>
