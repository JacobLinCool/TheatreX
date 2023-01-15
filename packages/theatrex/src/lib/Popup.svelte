<script lang="ts">
	export let id: string;
	export let title = "";
</script>

<label for="popup-{id}" {...$$props}>
	<slot name="button" />
</label>

<input type="checkbox" id="popup-{id}" class="modal-toggle" />
<label for="popup-{id}" class="modal cursor-pointer">
	<label class="modal-box relative max-w-sm" for="">
		{#if title}
			<h3 class="text-lg font-bold">{title}</h3>
			<div class="divider mt-0" />
		{/if}

		<slot name="body" />
	</label>
</label>
