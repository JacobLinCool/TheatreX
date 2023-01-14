import core from "$lib/server/core";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get("id") || "";
	await core.authenticated;
	const [prefix, ...rest] = id.split("::");
	const provider = core.providers.find((provider) => provider.prefix === prefix);
	return json(provider ? await provider.item(rest.join("::")) : undefined);
};
