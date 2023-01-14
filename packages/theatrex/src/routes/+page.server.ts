import { config } from "$lib/server/config";
import core from "$lib/server/core";
import fs from "$lib/server/fs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	await core.authenticated;
	return {
		config: config(),
		info: await Promise.all(core.providers.map((p) => p.info())),
		recent: fs.history["recent.json"].$data || [],
	};
};
