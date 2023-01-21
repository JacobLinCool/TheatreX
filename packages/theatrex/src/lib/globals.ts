import { writable } from "svelte/store";
import type { VideoJsPlayer } from "video.js";
import type { Item } from "@theatrex/types";
import { capture } from "./capture";

export const current_watching = writable<{ item: Item<true>; id: string } | undefined>(undefined);

export const player_hotkeys = writable({
	keys: {
		play: [" "],
		fast_rewind: ["ArrowLeft", "Control"],
		rewind: ["ArrowLeft"],
		fast_forward: ["ArrowRight", "Control"],
		forward: ["ArrowRight"],
		fullscreen: ["f"],
		mute: ["m"],
		capture: ["c", "Control"],
		quit: ["Escape"],
	},
	actions: {
		play: (player) => {
			if (player.paused()) {
				player.play();
			} else {
				player.pause();
			}
		},
		rewind: (player) => {
			player.currentTime(player.currentTime() - 5);
		},
		fast_rewind: (player) => {
			player.currentTime(player.currentTime() - 15);
		},
		forward: (player) => {
			player.currentTime(player.currentTime() + 5);
		},
		fast_forward: (player) => {
			player.currentTime(player.currentTime() + 15);
		},
		fullscreen: (player) => {
			if (document.fullscreenElement) {
				document.exitFullscreen();
			} else {
				player.requestFullscreen();
			}
		},
		mute: (player) => {
			player.muted(!player.muted());
		},
		capture: (player) => {
			if (player.title) {
				capture(player, `${player.title} - ${player.currentTime().toFixed(1)}`);
			} else {
				capture(player);
			}
		},
		quit: (player) => {
			if (!document.fullscreenElement) {
				current_watching.set(undefined);
				player.dispose();
			}
		},
		default: (player, keys) => {
			const number = Number(keys.values().next().value);
			if (number >= 0 || number <= 9) {
				player.currentTime(player.duration() * (number / 10));
				return;
			}

			console.log("unhandled hotkey", keys);
		},
	} as Record<string, (player: VideoJsPlayer & { title?: string }, keys: Set<string>) => void>,
});
