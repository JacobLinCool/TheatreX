import core from "$lib/server/core";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id || "";
	await core.authenticated;
	const [prefix, ...rest] = id.split("::");
	const provider = core.providers.find((provider) => provider.prefix === prefix);
	const data = await provider?.resource(rest.join("::"));
	return data
		? new Response(data, {
				headers: {
					"Cache-Control": "public, max-age=86400",
				},
		  })
		: new Response(null, { status: 404 });
};
