<script lang="ts">
	import CreateList from "$lib/CreateList.svelte";
	import List from "$lib/List.svelte";
	import { onMount } from "svelte";
	import { themeChange } from "theme-change";
	import type { Info, TheatrexConfig, ListItem } from "@theatrex/types";
	import { themes } from "./theme";

	export let data: {
		config: TheatrexConfig;
		info: Info<any>[];
		recent: ListItem[];
		lists: [id: string, name: string][];
	};

	const new_provider = {
		use: "",
		auth: {
			username: "",
		},
	};

	onMount(() => {
		themeChange(false);
	});

	async function update() {
		if (new_provider.use) {
			data.config.providers.push(JSON.parse(JSON.stringify(new_provider)));
			Object.assign(new_provider, { use: "", auth: { username: "" } });
		}

		await fetch("/api/provider/config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data.config),
		});

		location.reload();
	}

	async function reload() {
		await fetch("/api/provider/reload");
		location.reload();
	}
</script>

<svelte:head>
	<title>TheatreX</title>
	<meta name="description" content="TheatreX" />
</svelte:head>

<section class="h-full w-full p-2">
	<div class="flex h-full w-full flex-col items-center">
		{#if data.recent.length}
			<List items={data.recent} name="Recently Watched" />

			<div class="mb-4" />
		{/if}

		<div class="w-full px-2">
			<a class="mb-2 block text-lg font-bold" href="/personal/list">Your Lists</a>
			{#each data.lists as [id, name]}
				<a href="/personal/list/{id}" class="btn btn-outline btn-sm m-2 normal-case"
					>{name}</a
				>
			{/each}

			<CreateList>
				<span class="btn btn-outline btn-sm m-2 normal-case"> + </span>
			</CreateList>
		</div>

		<div class="divider" />

		<div class="form-control w-full max-w-md">
			<label class="label" for="theme-select">
				<span class="label-text">Theme</span>
			</label>
			<select data-choose-theme id="theme-select" class="select select-accent">
				{#each themes as theme}
					<option value={theme}>{theme}</option>
				{/each}
			</select>
		</div>

		<div class="divider" />

		<div class="my-4 w-full max-w-md">
			<h2 class="mb-2 font-bold">Providers</h2>
			{#each data.info as info, idx}
				<div
					class="collapse-arrow border-base-300 bg-base-100 rounded-box collapse mb-4 border"
					tabindex="-1"
				>
					<input type="checkbox" />
					<div class="collapse-title font-medium">
						<span class="text-lg">{info.name}</span>
						<br />
						<span class="text-sm">{data.config.providers[idx].use}</span>
					</div>
					<div class="collapse-content">
						{#each Object.entries(info.auth) as [key, reason]}
							<div class="form-control w-full">
								<span class="label">
									<span class="label-text">{key}</span>
									<span class="label-text-alt">{reason}</span>
								</span>
								<input
									type="text"
									bind:value={data.config.providers[idx].auth[key]}
									placeholder={reason}
									class="input input-bordered w-full"
								/>
							</div>
						{/each}

						<div class="divider" />

						<div class="flex justify-center">
							<button
								class="btn btn-error"
								on:click={() => {
									data.config.providers.splice(idx, 1);
									update();
								}}
							>
								Remove
							</button>
						</div>
					</div>
				</div>
			{/each}

			<div class="border-base-300 bg-base-100 rounded-box collapse border" tabindex="-1">
				<input type="checkbox" />
				<div class="collapse-title font-medium">
					<span class="text-lg">Add New Provider</span>
				</div>
				<div class="collapse-content">
					<div class="form-control w-full">
						<span class="label">
							<span class="label-text">Provider Path / URL</span>
						</span>
						<input
							type="text"
							bind:value={new_provider.use}
							class="input input-bordered w-full"
						/>
					</div>
					<div class="form-control w-full">
						<span class="label">
							<span class="label-text">Username</span>
							<span class="label-text-alt"> Leave this blank if not required </span>
						</span>
						<input
							type="text"
							bind:value={new_provider.auth.username}
							class="input input-bordered w-full"
						/>
					</div>
				</div>
			</div>

			<div class="w-full p-2">
				<div class="flex justify-center">
					<button
						class="btn btn-ghost border-base-300 bg-base-100 rounded-box m-1 border"
						on:click={update}
					>
						Save
					</button>

					<button
						class="btn btn-ghost border-base-300 bg-base-100 rounded-box m-1 border"
						on:click={reload}
					>
						Reload
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
