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

	test("default limit is 128", () => {
		const store = mapstore();
		for (let i = 0; i < 128; i++) {
			store.set(i.toString(), i);
		}
		for (let i = 0; i < 128; i++) {
			expect(store.get(i.toString())).toBe(i);
		}
		store.set("128", 128);
		expect(store.get("0")).toBeUndefined();
		expect(store.get("128")).toBe(128);
	});

	test("delete first item when limit is reached", () => {
		const store = mapstore();
		for (let i = 0; i < 128; i++) {
			store.set(i.toString(), i);
		}
		for (let i = 0; i < 128; i++) {
			expect(store.get(i.toString())).toBe(i);
		}
		store.set("0", 10000);
		store.set("128", 128);
		expect(store.get("0")).toBe(10000);
		expect(store.get("1")).toBeUndefined();
		expect(store.get("128")).toBe(128);
	});

	test("subspace should be limited independently", () => {
		const store = mapstore();
		for (let i = 0; i < 128; i++) {
			store.space("a").set(i.toString(), i);
		}
		for (let i = 0; i < 128; i++) {
			expect(store.space("a").get(i.toString())).toBe(i);
		}
		store.space("a").set("128", 128);
		expect(store.space("a").get("0")).toBeUndefined();
		expect(store.space("a").get("128")).toBe(128);

		for (let i = 0; i < 128; i++) {
			store.space("b").set(i.toString(), i);
		}
		for (let i = 0; i < 128; i++) {
			expect(store.space("b").get(i.toString())).toBe(i);
		}
		store.space("b").set("128", 128);
		expect(store.space("b").get("0")).toBeUndefined();
		expect(store.space("b").get("128")).toBe(128);
	});

	test("custom limit", () => {
		const limit = 8;
		const store = mapstore({
			after({ map }) {
				if (map.size > limit) {
					map.delete(map.keys().next().value);
				}
			},
		});
		for (let i = 0; i < limit; i++) {
			store.set(i.toString(), i);
		}
		for (let i = 0; i < limit; i++) {
			expect(store.get(i.toString())).toBe(i);
		}

		store.set(limit.toString(), limit);
		expect(store.get("0")).toBeUndefined();
		expect(store.get(limit.toString())).toBe(limit);
	});
});
