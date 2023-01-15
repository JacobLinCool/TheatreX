<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import CreateList from "$lib/CreateList.svelte";
	import Grid from "$lib/Grid.svelte";
	import UIListItem from "$lib/ListItem.svelte";
	import yaml from "js-yaml";
	import Icon from "@iconify/svelte";
	import type { List, ListItem } from "@theatrex/types";

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

		data = data;
	}

	function drag(evt: DragEvent, idx: number) {
		console.log("drag", evt, idx);
		if (!evt.dataTransfer) {
			return;
		}
		evt.dataTransfer.effectAllowed = "move";
		evt.dataTransfer.dropEffect = "move";
		evt.dataTransfer.setData("text/plain", idx.toString());
	}

	function drop(evt: DragEvent, idx: number) {
		console.log("drop", evt, idx);
		if (!evt.dataTransfer) {
			return;
		}
		const old_idx = parseInt(evt.dataTransfer.getData("text/plain"));
		const item = list.items[old_idx];
		list.items.splice(old_idx, 1);
		list.items.splice(idx, 0, item);
		update_list(list);
	}

	async function export_list(id: string) {
		const res = await fetch("/api/personal/list/" + id);
		const list = (await res.json()) as List;
		console.log(list);

		const data = yaml.dump({ id: list.id, name: list.name, items: list.items }, { indent: 4 });
		const blob = new Blob([data], { type: "text/yaml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");

		a.href = url;
		a.download = list.name + ".yaml";
		a.click();

		URL.revokeObjectURL(url);
		a.remove();
	}

	let imported_name = "";
	let imported_items: ListItem[] = [];
	async function import_list(evt: Event) {
		const input = evt.target as HTMLInputElement;
		if (!input.files) {
			return;
		}
		const file = input.files[0];
		const data = await file.text();
		const list = yaml.load(data) as List;
		imported_name = list.name;
		imported_items = list.items;

		document.querySelector<HTMLElement>("#import-new-list")?.click();
	}
</script>

<svelte:head>
	<title>{title} | TheatreX</title>
	<meta name="description" content="{title} | TheatreX" />
</svelte:head>

<section class="h-full w-full p-2">
	{#if data && "lists" in data}
		<div class="flex w-full items-center justify-between">
			<h1 class="mb-4 inline-block px-4 pt-4 text-2xl font-bold">Personal Lists</h1>

			<div>
				<label class="btn btn-outline btn-sm m-2 normal-case" for="import-list">
					<Icon icon="ant-design:import-outlined" class="inline" />
				</label>
				<input
					type="file"
					id="import-list"
					class="hidden"
					accept=".yaml,.yml"
					on:change={import_list}
				/>

				<CreateList name={imported_name} items={imported_items}>
					<span id="import-new-list" class="hidden" />
				</CreateList>

				<CreateList>
					<span class="btn btn-outline btn-sm m-2 normal-case">
						<Icon icon="ant-design:plus-outlined" class="inline" />
					</span>
				</CreateList>
			</div>
		</div>
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
			<div slot="name" class="flex items-center justify-between">
				<input
					class="input input-ghost hover:input-bordered m-2 text-xl font-bold"
					bind:value={data.name}
					placeholder="List Name"
					on:blur={() => {
						update_list(list);
					}}
				/>

				<button
					class="btn btn-outline btn-sm m-4"
					on:click={() => export_list($page.params.id)}
				>
					<Icon icon="mdi:download" />
				</button>
			</div>
			<div
				slot="item"
				let:item
				let:idx
				class="contents"
				draggable={true}
				on:dragstart={(evt) => drag(evt, idx)}
				on:dragover={(evt) => evt.preventDefault()}
				on:drop|preventDefault={(evt) => drop(evt, idx)}
			>
				<UIListItem {item} />
				<button
					class="btn btn-xs btn-error absolute top-0 right-0 mx-2 hidden group-hover:block"
					on:click={() => {
						list.items = list.items.filter((i) => i !== item);
						update_list(list);
					}}
				>
					<Icon icon="mdi:close" />
				</button>
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
