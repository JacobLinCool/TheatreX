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
