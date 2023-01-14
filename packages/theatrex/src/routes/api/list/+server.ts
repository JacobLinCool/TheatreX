import core from "$lib/server/core";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get("id") || "";
	await core.authenticated;
	const results = await Promise.all(
		core.providers.map((provider) => provider.list(id).catch(() => [])),
	);
	return json(results.flat());
};
