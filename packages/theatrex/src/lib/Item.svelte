<script lang="ts">
	import type { Item } from "@theatrex/types";
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
</script>

<div class="w-full">
	<h1 class="text-base-content p-2 pb-4 text-2xl font-bold">{item.name}</h1>

	<div class="flex flex-col md:flex-row">
		<div class="p-2">
			<div class="overflow-hidden rounded-md">
				<img src={item.cover} alt={item.name} class="w-full max-w-xs rounded-md" />
			</div>
		</div>
		<div class="flex-1 p-2">
			<div class="mb-2">
				{#each item.tags as tag}
					<a href="/search/?q={tag}" class="badge badge-outline mr-2">{tag}</a>
				{/each}
			</div>
			<p class="text-base-content whitespace-pre-line">{item.description}</p>
		</div>
	</div>

	<div class="divider" />

	{#each item.seasons as season}
		<ul class="menu rounded-box p-2">
			{#if season.name}
				<li class="menu-title">
					<span>{season.name}</span>
				</li>
			{/if}
			{#each season.episodes as episode}
				<li class="my-1">
					<button
						on:click={() => {
							$current_watching = { item, id: episode.id };
						}}
					>
						<div class="flex w-full items-center justify-between">
							<span>{episode.name}</span>
							{#if episode.watched > 0}
								<span class="text-base-content text-sm">
									<span class="hidden sm:inline"
										>watched {hms(episode.watched)}</span
									>
									({Math.round((episode.watched / episode.total) * 100)}%)
								</span>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	{/each}
</div>
