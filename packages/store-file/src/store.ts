import path from "node:path";
import type { Store, StoreOption } from "@theatrex/types";
import { store } from "./fs";

const HOUR = 60 * 60 * 1000;

const TYPE = {
	BUFFER: Buffer.from([0]),
	JSON: Buffer.from([2]),
	SET: Buffer.from([4]),
	MAP: Buffer.from([8]),
} as const;

export function filestore<T = any>(dir = ".filestore"): Store<T | undefined> {
	const fs = store(dir);
	const spaces = new Map<string, Store<any>>();
	fs.spaces.$list().forEach((name) => {
		spaces.set(name, filestore(path.join(dir, "spaces", name)));
	});

	return {
		space<V = T>(name: string): Store<V> {
			name = normalize(name);
			if (!spaces.has(name)) {
				spaces.set(name, filestore(path.join(dir, "spaces", name)));
			}

			return spaces.get(name) as Store<V>;
		},
		has(key: string): boolean {
			const file = fs.data[normalize(key)];
			if (!file.$exists) {
				return false;
			}

			const data = fs.data[normalize(key)].$data;
			if (!data) {
				return false;
			}

			const expires = Number(data.readBigInt64LE(0));
			if (expires < Date.now()) {
				fs.data[key].$data = undefined;
				return false;
			}

			return true;
		},
		get<V = T>(key: string): V | undefined {
			const data = fs.data[normalize(key)].$data;
			if (!data) {
				return undefined;
			}

			const expires = Number(data.readBigInt64LE(0));
			const type = data[8];
			const value = data.subarray(9);

			if (expires < Date.now()) {
				fs.data[key].$data = undefined;
				return undefined;
			}

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
		set<V = T>(key: string, value: V, opt?: StoreOption): void {
			key = normalize(key);
			const expires = date2buffer(Date.now() + (opt?.ttl ?? HOUR));

			if (value instanceof Buffer) {
				fs.data[key].$data = Buffer.concat([expires, TYPE.BUFFER, value]);
			} else if (value instanceof Set) {
				fs.data[key].$data = Buffer.concat([
					expires,
					TYPE.SET,
					Buffer.from(JSON.stringify([...value])),
				]);
			} else if (value instanceof Map) {
				fs.data[key].$data = Buffer.concat([
					expires,
					TYPE.MAP,
					Buffer.from(JSON.stringify([...value])),
				]);
			} else {
				fs.data[key].$data = Buffer.concat([
					expires,
					TYPE.JSON,
					Buffer.from(JSON.stringify(value)),
				]);
			}
		},
		delete(key: string): void {
			fs.data[normalize(key)].$data = undefined;
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

export function normalize(key: string): string {
	return key.replace(/[^a-z0-9]/gi, "-");
}

export function date2buffer(date: number): Buffer {
	const buffer = Buffer.alloc(8);
	buffer.writeBigInt64LE(BigInt(date));
	return buffer;
}
