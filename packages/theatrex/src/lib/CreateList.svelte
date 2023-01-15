<script lang="ts">
	import { goto } from "$app/navigation";
	import Icon from "@iconify/svelte";
	import type { ListItem } from "@theatrex/types";
	import Popup from "./Popup.svelte";

	export let name = "";
	export let items: ListItem[] = [];

	let random_id = Math.random().toString(36).slice(2);

	let err = "";
	$: {
		fetch("/api/personal/list/" + name.replace(/[/\s]/g, "-"))
			.then((res) => res.json())
			.then((data) => {
				if (data.id) {
					err = "List already exists";
				} else {
					err = "";
				}
			});
	}

	let composing = false;
	let creating = false;
	async function create_list(evt: KeyboardEvent) {
		if (evt.key !== "Enter" || composing || creating) {
			return;
		}
		creating = true;

		// @ts-expect-error
		document.activeElement?.blur();

		const id = name.replace(/[/\s]/g, "-");
		const res = await fetch("/api/personal/list/" + id, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, items, id }),
		});

		if (res.ok) {
			document.getElementById("create-list")?.click();
			goto("/personal/list/" + id, { invalidateAll: true });
		} else {
			creating = false;
		}
	}
</script>

<Popup id="create-new-list-{random_id}" title="Create New List">
	<slot slot="button" />
	<div slot="body">
		<div class="form-control w-full">
			<span class="label">
				<span class="label-text">List Name</span>
				<span class="label-text-alt text-error">{err}</span>
			</span>
			<input
				type="text"
				bind:value={name}
				placeholder="List Name"
				class="input input-bordered w-full"
				disabled={creating}
				on:keyup={create_list}
				on:compositionstart={() => (composing = true)}
				on:compositionend={() => setTimeout(() => (composing = false), 100)}
			/>
			<span class="label">
				<span class="label-text-alt" />
				<span class="label-text-alt">
					Press <kbd class="kbd kbd-sm">Enter</kbd> to create the list
				</span>
			</span>
		</div>

		<div class="divider" />

		<p class="p-2">
			After creating the list, you can add series to it by clicking the
			<kbd class="kbd kbd-sm mx-2"><Icon icon="mdi:plus-box-outline" class="inline" /></kbd> button
			on the series page.
		</p>
	</div>
</Popup>
