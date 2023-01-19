<script lang="ts">
	import type { ListItem } from "@theatrex/types";

	export let item: ListItem;
</script>

<a href="/item/{item.id}" class="group">
	<div class="w-[45vw] p-2 sm:w-[30vw] md:w-[22.5vw] lg:w-[18vw] xl:w-[15vw]">
		<div class="w-full overflow-hidden rounded-md">
			<img
				src={item.cover}
				alt={item.name}
				class="bg-base-200 aspect-[5/7] w-full rounded-md transition-transform duration-200 group-hover:scale-105"
				loading="lazy"
			/>
		</div>
		<p class="text-base-content text-center text-sm">{item.name}</p>
	</div>
</a>
