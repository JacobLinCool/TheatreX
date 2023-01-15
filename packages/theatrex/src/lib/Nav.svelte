<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Icon from "@iconify/svelte";
	import type { Tab } from "@theatrex/types";

	export let tabs: Tab[];

	let query = "";

	async function search(evt: KeyboardEvent) {
		if (evt.key === "Enter") {
			goto(`/search?q=${query}`);
		}
	}
</script>

<header class="navbar bg-base-200">
	<div class="flex-1">
		<a class="btn btn-ghost text-light text-xl normal-case" href="/">TheatreX</a>

		<div class="tabs tabs-boxed bg-transparent">
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
	<div class="flex-none gap-2">
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
					<Icon icon="mdi:magnify" class="text-base-content hover:text-accent" />
				</a>
			</div>
		{/if}
	</div>
</header>
