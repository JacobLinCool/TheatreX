import fs from "$lib/server/fs";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id.trim();
	if (!id) {
		const lists = fs.lists.$list().map((list) => [list, fs.lists[list].$data?.name]);
		return { lists };
	}

	return fs.lists[id].$data ?? { id: "" };
};
