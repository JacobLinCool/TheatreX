<script lang="ts">
	import { page } from "$app/stores";
	import { onMount, onDestroy } from "svelte";
	import videojs from "video.js";
	import "video.js/dist/video-js.min.css";
	import type { Item } from "@theatrex/types";
	import { current_watching } from "./globals";

	export let item: Item<true>;
	export let id: string;

	$: episode = item.seasons
		.flatMap((season) => season.episodes)
		.find((episode) => episode.id === id);

	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	let player: videojs.Player;
	$: {
		if (mounted && episode) {
			player = videojs("#player", {
				controls: true,
				autoplay: true,
				sources: [
					{
						src: $page.url.origin + "/api/resource/" + episode.id,
					},
				],
			});

			if ($current_watching && episode.watched > player.currentTime()) {
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
						body: JSON.stringify({ episode: episode.id, watched, total }),
					});
					console.log("updated watched time", episode, watched, total);
				}
			});
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
	<div class="w-full">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video id="player" class="video-js w-full" />
	</div>
</div>
