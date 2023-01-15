import core from "$lib/server/core";
import fs from "$lib/server/fs";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ params }) => {
	const id = params.id;
	const [prefix, ...rest] = id.split("::");
	await core.authenticated;
	const provider = core.providers.find((provider) => provider.prefix === prefix);

	const item = (await provider?.item(rest.join("::"))) || undefined;

	if (item) {
		const state = fs.state[prefix][rest.join("::")].$data ?? {};
		for (const season of item.seasons) {
			for (const episode of season.episodes) {
				const data = state[episode.res];

				episode.watched = data?.watched ?? 0;
				episode.total = data?.total ?? 0;
			}
		}
	}

	return { item };
};
