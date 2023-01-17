import os from "node:os";
import path from "node:path";
import core from "./core";

export async function get_item(id: string) {
	const [prefix, ...rest] = id.split("::");
	await core.authenticated;
	const provider = core.providers.find((provider) => provider.prefix === prefix);

	return (await provider?.item(rest.join("::"))) || undefined;
}

export function update_history(
	list: { watched: number; id: string; name: string; cover: string }[],
	item: { watched: number; id: string; name?: string; cover?: string },
	option?: {
		sort: "latest" | "watched";
	},
): { watched: number; id: string; name: string; cover: string }[] {
	const index = list.findIndex((i) => i.id === item.id);

	const result: { watched: number; id: string; name: string; cover: string }[] = [];

	if (index === -1) {
		result.push({ name: "", cover: "", ...item }, ...list);
	} else {
		result.push(...list);
		result[index].watched += item.watched;
	}

	if (option?.sort === "latest") {
		const [x] = result.splice(index, 1);
		result.unshift(x);
	} else {
		result.sort((a, b) => b.watched - a.watched);
	}

	return result;
}

export function sort_object_by_key<T>(obj: Record<string, T>): Record<string, T> {
	return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}

export function port_hash(use: string): number {
	use = use
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.trim();

	let hash = 0;
	for (let i = 0; i < use.length; i++) {
		hash = (hash << 5) - hash + use.charCodeAt(i);
		hash |= 0;
		hash %= 20011;
	}
	return hash;
}

export function normalize(location: string): string {
	return path.normalize(path.resolve(location.replace(/^~/, os.homedir())));
}
