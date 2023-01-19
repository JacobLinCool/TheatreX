<script lang="ts">
	import SvelteMarkdown from "svelte-markdown";
	import Icon from "@iconify/svelte";
	import type { Item } from "@theatrex/types";
	import Popup from "./Popup.svelte";
	import { current_watching } from "./globals";

	export let item: Item<true>;

	function hms(d: number) {
		const h = Math.floor(d / 3600);
		const m = Math.floor((d % 3600) / 60);
		const s = Math.floor((d % 3600) % 60);

		const hour = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
		const min = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
		const sec = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
		const hms = hour + min + sec;

		if (hms === "") {
			return "0 seconds";
		}

		return hms;
	}

	let lists: [string, string][] = [];

	async function fetch_lists() {
		const res = await fetch("/api/personal/list");
		const data = await res.json();
		console.log(data);

		lists.push(...data.lists);
		lists = lists;
	}

	let added_message = "";
	async function add_to_list() {
		const select = document.querySelector<HTMLSelectElement>("#list-select");
		if (!select) {
			return;
		}
		const id = select.value;
		const name = select.options[select.selectedIndex].text;

		const res = await fetch("/api/personal/list/" + id, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				id: item.id,
				name: item.name,
				cover: item.cover,
			}),
		});

		if (res.ok) {
			added_message = `Added to list "${name}"`;
		}
	}
</script>

<div class="w-full">
	<h1 class="text-base-content p-2 pb-4 text-2xl font-bold">
		{item.name}

		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<Popup id="add-to-list" title="Add to List">
			<div
				slot="button"
				class="btn btn-ghost float-right text-2xl"
				on:click={() => {
					if (lists.length === 0) {
						fetch_lists();
					}
				}}
			>
				<Icon icon="mdi:plus-box-outline" />
			</div>

			<div slot="body" class="form-control w-full">
				<span class="label">
					<span class="label-text">Select List</span>
				</span>

				<select id="list-select" class="select select-bordered w-full">
					{#each lists as list}
						<option value={list[0]}>{list[1]}</option>
					{/each}
				</select>

				<button class="btn btn-sm mt-4 p-2" on:click={add_to_list}> Add </button>

				<div class="divider" />

				{#if added_message}
					<p class="text-base-content mt-2 text-sm">{added_message}</p>
				{/if}
			</div>
		</Popup>
	</h1>

	<div class="flex flex-col md:flex-row">
		<div class="p-2">
			<div class="overflow-hidden rounded-md">
				<img src={item.cover} alt={item.name} class="mx-auto w-full max-w-xs rounded-md" />
			</div>
		</div>
		<div class="flex-1 p-2">
			<div class="mb-2">
				{#each item.tags as tag}
					<a href="/search/?q={tag}" class="badge badge-outline mr-2">{tag}</a>
				{/each}
			</div>
			<dive class="text-base-content prose contents whitespace-pre-line">
				<SvelteMarkdown source={item.description} />
			</dive>
		</div>
	</div>

	<div class="divider" />

	{#each item.seasons as season}
		<ul class="menu rounded-box p-2">
			<div class="menu-title flex items-center justify-between">
				<span>{season.name}</span>
				<span
					>{season.episodes.length} episode{season.episodes.length !== 1 ? "s" : ""}</span
				>
			</div>

			{#each season.episodes as episode}
				<li class="my-1">
					<button
						on:click={() => {
							$current_watching = { item, id: episode.res };
						}}
					>
						<div class="flex w-full items-center justify-between">
							<span>{episode.name}</span>
							{#if episode.watched > 0}
								<span class="text-base-content text-sm">
									<span class="hidden sm:inline"
										>watched {hms(episode.watched)} (</span
									>{Math.round((episode.watched / episode.total) * 100)}%<span
										class="hidden sm:inline">)</span
									>
								</span>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/each}
</div>
