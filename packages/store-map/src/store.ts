import type { Store, StoreOption } from "@theatrex/types";

const HOUR = 60 * 60 * 1000;

export function mapstore<T = any>(): Store<T | undefined> {
	const data = new Map<string, [number, any]>();
	const spaces = new Map<string, Store<T>>();

	return {
		space<V = T>(name: string): Store<V> {
			if (!spaces.has(name)) {
				spaces.set(name, mapstore());
			}

			return spaces.get(name) as Store<V>;
		},
		has(key: string): boolean {
			const item = data.get(key);
			if (!item) {
				return false;
			}
			if (item[0] < Date.now()) {
				data.delete(key);
				return false;
			}
			return true;
		},
		get<V = T>(key: string): V | undefined {
			const item = data.get(key);
			if (!item) {
				return undefined;
			}
			if (item[0] < Date.now()) {
				data.delete(key);
				return undefined;
			}
			return item[1];
		},
		set<V = T>(key: string, value: V, opt?: StoreOption): void {
			data.set(key, [Date.now() + (opt?.ttl ?? HOUR), value]);
		},
		delete(key: string): void {
			data.delete(key);
		},
		clear(): void {
			data.clear();
		},
		keys(): string[] {
			return [...data.keys()];
		},
		values<V = T>(): Exclude<V, undefined>[] {
			return [...data.values()].map((v) => v[1]);
		},
		pairs<V = T>(): [string, Exclude<V, undefined>][] {
			return [...data.entries()].map(([k, v]) => [k, v[1]]);
		},
		prune(): void {
			for (const key of data.keys()) {
				this.has(key);
			}
			for (const space of spaces.values()) {
				space.prune();
			}
		},
	};
}
