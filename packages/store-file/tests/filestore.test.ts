import fs from "fs";
import { filestore } from "../src";

const clean = () => {
	if (fs.existsSync(".filestore")) {
		fs.rmSync(".filestore", { recursive: true });
	}
};

beforeAll(clean);
afterAll(clean);

describe("filestore", () => {
	test("has, get, set, delete", () => {
		const store = filestore();
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
		const store = filestore();
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
		const store = filestore();
		const buffer = Buffer.from("hello");
		store.set("a", buffer);
		expect(store.get("a")).toEqual(buffer);
	});

	test("support Set", () => {
		const store = filestore();
		const set = new Set([1, 2, 3]);
		store.set("a", set);
		expect(store.get("a")).toEqual(set);
	});

	test("support Map", () => {
		const store = filestore();
		const map = new Map([
			["a", 1],
			["b", 2],
		]);
		store.set("a", map);
		expect(store.get("a")).toEqual(map);
	});

	test("support JSON", () => {
		const store = filestore();
		const json = { a: 1, b: 2, c: [3, 4] };
		store.set("a", json);
		expect(store.get("a")).toEqual(json);
	});

	test("subspace", async () => {
		const store = filestore();
		const sub = store.space("x");
		sub.set("a", 1);
		expect(sub.has("a")).toBe(true);
		expect(sub.get("a")).toBe(1);
		expect(store.space("x")).toBe(sub);
	});

	test("expires after ttl", async () => {
		const store = filestore();
		const json = { a: 1, b: 2, c: [3, 4] };
		store.set("b", json, { ttl: 100 });
		expect(store.has("b")).toBe(true);
		expect(store.get("b")).toEqual(json);
		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(store.has("b")).toBe(false);
		expect(store.get("b")).toBeUndefined();
	});
});
