export interface MapStoreConfig<T> {
	before?(data: { key: string; val: T; map: Map<string, T> }): void;
	after?(data: { key: string; val: T; map: Map<string, T> }): void;
}
