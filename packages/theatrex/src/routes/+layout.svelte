<script lang="ts">
	import { page } from "$app/stores";
	import Nav from "$lib/Nav.svelte";
	import PageTransitions from "$lib/PageTransitions.svelte";
	import Player from "$lib/Player.svelte";
	import { current_watching } from "$lib/globals";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { themeChange } from "theme-change";
	import type { Tab } from "@theatrex/types";
	import "./styles.css";

	export let data: {
		tabs: Tab[];
	};

	let done = false;
	onMount(() => {
		try {
			document.querySelector("#launching-status")?.remove();
		} catch {}

		themeChange(false);
		done = true;

		const keydown = (e: KeyboardEvent) => {
			if (document.activeElement instanceof HTMLInputElement) {
				return;
			}

			if (e.key === "Backspace") {
				history.back();
			}
		};

		document.addEventListener("keydown", keydown);
	});

	$: {
		if (done) {
			$page.route.id;
			const container = document.querySelector("#main-container");
			if (container) {
				container.scrollTo(0, 0);
			}
		}
	}
</script>

{#if done}
	<div class="flex h-full w-full flex-col">
		<Nav tabs={data.tabs} />
		<div id="main-container" class="w-full flex-1 overflow-auto">
			{#key $page.route.id}
				<PageTransitions>
					<slot />
				</PageTransitions>
			{/key}
		</div>
	</div>

	{#if $current_watching}
		<div class="fixed top-0 left-0" in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}>
			<Player item={$current_watching.item} id={$current_watching.id} />
		</div>
	{/if}
{/if}
