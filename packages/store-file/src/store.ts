import path from "node:path";
import type { Store } from "@theatrex/types";
import { store } from "./fs";

const TYPE = {
	BUFFER: Buffer.from([0]),
	JSON: Buffer.from([2]),
	SET: Buffer.from([4]),
	MAP: Buffer.from([8]),
} as const;

export function filestore<T = any>(dir = ".filestore"): Store<T | undefined> {
	const fs = store(dir);
	const spaces = new Map<string, Store<any>>();

	return {
		space<V = T>(name: string): Store<V> {
			name = name.replace(/[^a-z0-9]/gi, "-");
			if (!spaces.has(name)) {
				spaces.set(name, filestore(path.join(dir, name)));
			}

			return spaces.get(name) as Store<V>;
		},
		has(key: string): boolean {
			return fs.data[key].$exists;
		},
		get<V = T>(key: string): V | undefined {
			const data = fs.data[key].$data;
			if (!data) {
				return undefined;
			}

			const type = data[0];
			const value = data.subarray(1);

			if (type === TYPE.BUFFER[0]) {
				return value as V;
			} else if (type === TYPE.JSON[0]) {
				return JSON.parse(value.toString()) as V;
			} else if (type === TYPE.SET[0]) {
				return new Set(JSON.parse(value.toString())) as V;
			} else if (type === TYPE.MAP[0]) {
				return new Map(JSON.parse(value.toString())) as V;
			} else {
				throw new Error("Invalid data type");
			}
		},
		set<V = T>(key: string, value: V): void {
			if (value instanceof Buffer) {
				fs.data[key].$data = Buffer.concat([TYPE.BUFFER, value]);
			} else if (value instanceof Set) {
				fs.data[key].$data = Buffer.concat([
					TYPE.SET,
					Buffer.from(JSON.stringify([...value])),
				]);
			} else if (value instanceof Map) {
				fs.data[key].$data = Buffer.concat([
					TYPE.MAP,
					Buffer.from(JSON.stringify([...value])),
				]);
			} else {
				fs.data[key].$data = Buffer.concat([TYPE.JSON, Buffer.from(JSON.stringify(value))]);
			}
		},
		delete(key: string): void {
			fs.data[key].$data = undefined;
		},
		clear(): void {
			fs.data.$remove();
		},
		keys(): string[] {
			return fs.data.$list();
		},
		values<V = T>(): Exclude<V, undefined>[] {
			return (this.keys() as string[]).map((key) => this.get(key)) as any;
		},
		pairs<V = T>(): [string, Exclude<V, undefined>][] {
			return (this.keys() as string[]).map((key) => [key, this.get(key)]) as any;
		},
	};
}
