<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import videojs from "video.js";
	import "video.js/dist/video-js.min.css";
	import type { Item } from "@theatrex/types";
	import { current_watching, player_hotkeys } from "./globals";

	export let item: Item<true>;
	export let id: string;

	$: episodes = item.seasons.flatMap((season) => season.episodes);
	$: episode = episodes.find((episode) => episode.res === id);

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	let show_info = false;
	let show_info_deferring: any = 0;

	let player: videojs.Player & { title?: string };
	$: {
		if (mounted && episode) {
			const first_time = !player;
			if (first_time) {
				player = videojs("#player", {
					controls: true,
					autoplay: true,
					userActions: {
						// @ts-expect-error
						hotkeys: (evt: KeyboardEvent) => {
							const keys = new Set<string>();
							if (evt.shiftKey) {
								keys.add("Shift");
							}
							if (evt.ctrlKey || evt.metaKey) {
								keys.add("Control");
							}
							if (evt.altKey) {
								keys.add("alt");
							}
							if (
								evt.key &&
								["Shift", "Control", "Meta", "Alt"].indexOf(evt.key) === -1
							) {
								keys.add(evt.key);
							}

							for (const [key, val] of Object.entries($player_hotkeys.keys)) {
								if (val.every((k) => keys.has(k))) {
									evt.preventDefault();
									evt.stopPropagation();
									$player_hotkeys.actions[key](player, keys);
									return;
								}
							}

							$player_hotkeys.actions.default(player, keys);
						},
					},
				});
				player.focus();

				inject_panel();
			}
			const source = $page.url.origin + "/api/resource/" + episode.res;
			if (player.src() !== source) {
				player.src(source);
				console.log("load source", episode.res);
				player.title = `${item.name} - ${episode.name}`;
			}

			if (first_time) {
				if (
					$current_watching &&
					episode.watched > player.currentTime() &&
					episode.watched / episode.total < 0.95
				) {
					player.currentTime(episode.watched);
				}

				player.on("timeupdate", async () => {
					const total = Math.floor(player.duration());
					const watched = Math.floor(player.currentTime());

					if (episode && episode.watched < watched) {
						episode.watched = watched;
						episode.total = total;

						await fetch("/api/personal/watched/" + item.id, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ episode: episode.res, watched, total }),
						});
						console.log("updated watched time", episode, watched, total);
					}
				});

				player.on("ended", async () => {
					const next_idx = episodes.findIndex((e) => e.res === episode?.res) + 1;
					if (next_idx < 1) {
						return;
					}

					const next_episode = episodes[next_idx];
					if (next_episode) {
						$current_watching = {
							item,
							id: next_episode.res,
						};
					}
				});

				player.on("pause", () => {
					show_info_deferring = setTimeout(() => {
						show_info = true;
					}, 1500);
				});

				player.on("play", () => {
					show_info = false;
					clearTimeout(show_info_deferring);
				});
			}
		}
	}

	function hide() {
		if (player) {
			player.dispose();
		}
		$current_watching = undefined;
		mounted = false;
	}

	function inject_panel() {
		const player = document.querySelector(".theatrex-player");
		const panel = document.querySelector("#info-panel");

		if (!player || !panel) {
			return;
		}

		player.appendChild(panel);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-black/80"
	on:click={(evt) => {
		if (evt.target === evt.currentTarget) {
			hide();
		}
	}}
>
	<div class="flex aspect-video max-h-[90%] w-full items-center justify-center">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video id="player" class="theatrex-player video-js max-h-full w-full" />
		<div
			id="info-panel"
			class="pointer-events-none absolute top-0 left-0 h-full w-full {show_info
				? 'opacity-100'
				: 'opacity-0'} flex items-center justify-between bg-black/60 p-4 transition-opacity duration-500"
		>
			<div>
				<h1 class="text-base-content my-2 text-xl md:text-2xl lg:text-4xl">
					{item.name}
				</h1>
				<h2 class="text-base-content my-2 text-lg md:text-xl lg:text-2xl">
					{episode?.name || ""}
				</h2>
				<p class="text-base-content my-2">
					{episode?.description || ""}
				</p>
			</div>
			<div
				class="carousel carousel-vertical hidden h-full p-2 lg:block"
				class:pointer-events-auto={show_info}
			>
				{#each episodes as ep}
					<div
						class="carousel-item btn my-2 min-w-[10rem] {episode?.res === ep.res
							? 'btn-outline'
							: 'btn-ghost'}"
						on:click={() => {
							$current_watching = { item, id: ep.res };
						}}
					>
						{ep.name}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
