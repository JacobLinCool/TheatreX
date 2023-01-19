import { mapstore } from "../src";

describe("mapstore", () => {
	test("has, get, set, delete", () => {
		const store = mapstore();
		expect(store.has("a")).toBe(false);
		expect(store.get("a")).toBeUndefined();
		store.set("a", 1);
		expect(store.has("a")).toBe(true);
		expect(store.get("a")).toBe(1);
		store.delete("a");
		expect(store.has("a")).toBe(false);
		expect(store.get("a")).toBeUndefined();
	});

	test("clear, keys, values, pairs", () => {
		const store = mapstore();
		for (let i = 0; i < 3; i++) {
			store.set(i.toString(), i);
		}
		expect(store.keys()).toEqual(["0", "1", "2"]);
		expect(store.values()).toEqual([0, 1, 2]);
		expect(store.pairs()).toEqual([
			["0", 0],
			["1", 1],
			["2", 2],
		]);
		store.clear();
		expect(store.keys()).toEqual([]);
		expect(store.values()).toEqual([]);
		expect(store.pairs()).toEqual([]);
	});

	test("support Buffer", () => {
		const store = mapstore();
		const buffer = Buffer.from("hello");
		store.set("a", buffer);
		expect(store.get("a")).toBe(buffer);
	});

	test("support Set", () => {
		const store = mapstore();
		const set = new Set([1, 2, 3]);
		store.set("a", set);
		expect(store.get("a")).toBe(set);
	});

	test("support Map", () => {
		const store = mapstore();
		const map = new Map([
			["a", 1],
			["b", 2],
		]);
		store.set("a", map);
		expect(store.get("a")).toBe(map);
	});

	test("support JSON", () => {
		const store = mapstore();
		const json = { a: 1, b: 2, c: [3, 4] };
		store.set("a", json);
		expect(store.get("a")).toEqual(json);
	});

	test("subspace", async () => {
		const store = mapstore();
		const sub = store.space("x");
		sub.set("a", 1);
		expect(sub.has("a")).toBe(true);
		expect(sub.get("a")).toBe(1);
		expect(store.space("x")).toBe(sub);
	});

	test("expires after ttl", async () => {
		const store = mapstore();
		const json = { a: 1, b: 2, c: [3, 4] };
		store.set("a", json, { ttl: 100 });
		expect(store.has("a")).toBe(true);
		expect(store.get("a")).toEqual(json);
		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(store.has("a")).toBe(false);
		expect(store.get("a")).toBeUndefined();
	});
});
