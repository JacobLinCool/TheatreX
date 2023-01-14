import { config } from "$lib/server/config";
import core from "$lib/server/core";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	const config = await request.json();

	try {
		core.update(config);
		return json(await Promise.all(core.providers.map((p) => p.check())));
	} catch (err) {
		if (err instanceof Error) {
			return json({ error: err.message });
		}
	}

	return json({ error: "Unknown error" });
};

export const GET: RequestHandler = async () => {
	return json(config());
};
