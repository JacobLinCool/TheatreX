import core from "$lib/server/core";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get("q") || "";
	await core.authenticated;
	const results = await Promise.all(
		core.providers.map(async (p) => {
			const items = (await p.search(q).catch(() => [])).sort((a, b) => b.score - a.score);
			const { name } = await p.info();
			return { name, items };
		}),
	);
	return json(results);
};
