import core from "$lib/server/core";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async () => {
	await core.authenticated;
	const info = await Promise.all(core.providers.map((provider) => provider.info()));
	const tabs = info.map((info) => info.tabs).flat();

	return { tabs, version: core.version };
};
