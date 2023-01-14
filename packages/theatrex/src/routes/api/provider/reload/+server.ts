import core from "$lib/server/core";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
	core.reload();
	return json({ providers: core.providers.map((p) => p.prefix) });
};
