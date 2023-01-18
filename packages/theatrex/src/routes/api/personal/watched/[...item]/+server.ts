import fs from "$lib/server/fs";
import { take_snapshot } from "$lib/server/notification";
import { get_item, sort_object_by_key, update_history } from "$lib/server/utils";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const item = await get_item(params.item || "");
		if (!item) {
			throw new Error("No item specified");
		}
		const [prefix, ...rest] = (params.item || "").split("::");
		const data: { episode: string; watched: number; total: number } = await request.json();

		const file = fs.state[prefix][rest.join("::")];
		const result = sort_object_by_key({
			...file.$data,
			[data.episode]: { watched: data.watched, total: data.total },
		});
		file.$data = result;

		const record = {
			id: item.id,
			name: item.name,
			cover: item.cover,
			watched: data.watched,
		};

		fs.history["recent.json"].$data = update_history(
			fs.history["recent.json"].$data || [],
			record,
			{ sort: "latest" },
		).slice(0, 10);

		const date = new Date();
		const [year, month] = [date.getFullYear(), date.getMonth() + 1].map((n) =>
			n.toString().padStart(2, "0"),
		);
		const key = `${year}-${month}`;

		fs.history.timeline[key].$data = update_history(
			fs.history.timeline[key].$data || [],
			record,
		);

		take_snapshot(prefix, rest.join("::"));

		return json(result);
	} catch (err) {
		if (err instanceof Error) {
			return json({ error: err.message });
		}
		return json({ error: "Unknown error" });
	}
};

export const GET: RequestHandler = async ({ params }) => {
	const item = params.item;
	if (!item) {
		throw new Error("No item specified");
	}

	const [prefix, ...rest] = item.split("::");
	const file = fs.state[prefix][rest.join("::")];

	return json(file.$data || {});
};
