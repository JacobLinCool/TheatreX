import type { Store } from "@theatrex/types";
import * as guards from "./guards";
import type { MapStoreConfig } from "./types";

export function mapstore<T = any>({
	before = guards.before,
	after = guards.after,
}: MapStoreConfig<T> = {}): Store<T | undefined> {
	const data = new Map<string, T>();
	const spaces = new Map<string, Store<T>>();

	return {
		space<V = T>(name: string): Store<V> {
			if (!spaces.has(name)) {
				spaces.set(name, mapstore({ before, after }));
			}

			return spaces.get(name) as Store<V>;
		},
		has(key: string): boolean {
			return data.has(key);
		},
		get<V = T>(key: string): V {
			return data.get(key) as V;
		},
		set<V = T>(key: string, value: V): void {
			before({ key, val: value as unknown as T, map: data });
			data.set(key, value as unknown as T);
			after({ key, val: value as unknown as T, map: data });
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
			return [...data.values()] as any;
		},
		pairs<V = T>(): [string, Exclude<V, undefined>][] {
			return [...data.entries()] as any;
		},
	};
}
