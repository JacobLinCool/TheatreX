export interface Store<T = any> {
	space<V = T>(name: string): Store<V>;
	has(key: string): Promise<boolean> | boolean;
	get<V = T>(key: string): Promise<V | undefined> | V | undefined;
	set<V = T>(key: string, value: V): Promise<void> | void;
	delete(key: string): Promise<void> | void;
	clear(): Promise<void> | void;
	keys(): Promise<string[]> | string[];
	values<V = T>(): Promise<Exclude<V, undefined>[]> | Exclude<V, undefined>[];
	pairs<V = T>(): Promise<[string, Exclude<V, undefined>][]> | [string, Exclude<V, undefined>][];
}
