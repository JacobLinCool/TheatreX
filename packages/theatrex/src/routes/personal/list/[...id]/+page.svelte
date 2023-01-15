<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import CreateList from "$lib/CreateList.svelte";
	import Grid from "$lib/Grid.svelte";
	import Popup from "$lib/Popup.svelte";
	import type { List } from "@theatrex/types";

	export let data: List | { lists: [string, string][] };
	let list: List = data as List;

	let title =
		data && "lists" in data ? "Personal Lists" : data.id === "" ? "List Not Found" : data.name;

	async function delete_list(id: string) {
		const res = await fetch("/api/personal/list/" + id, {
			method: "DELETE",
		});

		if (res.ok) {
			goto("/personal/list", { invalidateAll: true });
		}
	}

	async function update_list(list: List) {
		if (!list.name) {
			return;
		}
		await fetch("/api/personal/list/" + list.id, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(list),
		});
	}
</script>

<svelte:head>
	<title>{title} | TheatreX</title>
	<meta name="description" content="{title} | TheatreX" />
</svelte:head>

<section class="h-full w-full p-2">
	{#if data && "lists" in data}
		<h1 class="mb-4 px-4 pt-4 text-2xl font-bold">Personal Lists</h1>
		{#each data.lists as list}
			<div class="my-1 flex w-full p-2">
				<a href="/personal/list/{list[0]}" class="btn mr-2 flex-1 justify-start">
					{list[1]}
				</a>
				<div>
					<button
						class="btn btn-error btn-outline"
						on:click={() => {
							delete_list(list[0]);
						}}>Delete</button
					>
				</div>
			</div>
		{/each}

		{#if data.lists.length === 0}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<p class="m-4 text-xl">No lists found. Create one?</p>
				<CreateList>
					<span class="btn">Create New List</span>
				</CreateList>
			</div>
		{/if}
	{:else if data.id}
		<Grid items={data.items}>
			<div slot="name">
				<input
					class="input input-ghost hover:input-bordered m-2 text-xl font-bold"
					bind:value={data.name}
					placeholder="List Name"
					on:blur={() => {
						update_list(list);
					}}
				/>
			</div>
		</Grid>
	{:else}
		<div class="flex h-full w-full flex-col items-center justify-center">
			<p class="m-4 text-xl">Sorry, we couldn't find that list.</p>
			<CreateList name={$page.params.id}>
				<span class="btn">Create This List</span>
			</CreateList>
		</div>
	{/if}
</section>
