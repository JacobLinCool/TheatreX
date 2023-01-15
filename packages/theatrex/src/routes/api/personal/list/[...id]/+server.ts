import fs from "$lib/server/fs";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import type { List, ListItem } from "@theatrex/types";

export const POST: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		throw new Error("No id specified");
	}

	const data: List = await request.json();

	fs.lists[id].$data = data;
	return json(data);
};

export const GET: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) {
		const lists = fs.lists.$list().map((list) => [list, fs.lists[list].$data?.name]);
		return json({ lists });
	}

	return json(fs.lists[id].$data ?? { id: "" });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) {
		throw new Error("No id specified");
	}

	const data: ListItem = await request.json();
	const list = fs.lists[id].$data || {
		id,
		name: id,
		items: [],
	};

	const index = list.items.findIndex((item) => item.id === data.id);
	if (index === -1) {
		list.items.push(data);
	}

	fs.lists[id].$data = list;
	return json(list);
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = params.id;
	if (!id) {
		throw new Error("No id specified");
	}

	fs.lists[id].$data = undefined;
	return json(null);
};
