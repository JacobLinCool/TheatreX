import core from "$lib/server/core";
import type { List } from "@theatrex/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
	const id = params.id;

	const info = await Promise.all(core.providers.map((provider) => provider.info()));
	const tabs = info.map((provider) => provider.tabs).flat();
	const tab = tabs.find((tab) => tab.name === id);

	if (!tab) {
		return undefined;
	}

	await core.authenticated;
	const lists = (
		await Promise.all(
			tab.lists
				.map((list) =>
					core.providers.map((provider) => provider.list(list).catch(() => undefined)),
				)
				.flat(),
		)
	).filter((list) => list !== undefined && list.items.length > 0) as List[];

	return {
		name: tab.name,
		lists,
	};
};
