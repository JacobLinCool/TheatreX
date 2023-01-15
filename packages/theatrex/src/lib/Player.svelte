<script lang="ts">
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import videojs from "video.js";
	import "video.js/dist/video-js.min.css";
	import type { Item } from "@theatrex/types";
	import { current_watching } from "./globals";

	export let item: Item<true>;
	export let id: string;

	$: episodes = item.seasons.flatMap((season) => season.episodes);
	$: episode = episodes.find((episode) => episode.res === id);

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	let player: videojs.Player;
	$: {
		if (mounted && episode) {
			const first_time = !player;
			if (first_time) {
				player = videojs("#player", {
					controls: true,
					autoplay: true,
				});
			}
			const source = $page.url.origin + "/api/resource/" + episode.res;
			if (player.src() !== source) {
				player.src(source);
				console.log("load source", episode.res);
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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="bg-base-300/70 fixed top-0 left-0 flex h-full w-full items-center justify-center"
	on:click={(evt) => {
		if (evt.target === evt.currentTarget) {
			hide();
		}
	}}
>
	<div class="flex aspect-video max-h-[90%] w-full items-center justify-center">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video id="player" class="video-js max-h-full w-full" />
	</div>
</div>
