/**
 * The default before hook for the mapstore.
 * If the map has the key, it will delete it first, so that the key is always the last one.
 */
export function before({ key, map }: { key: string; map: Map<string, any> }) {
	if (map.has(key)) {
		map.delete(key);
	}
}

/**
 * The default after hook for the mapstore.
 * If the map has more than 128 entries, it will delete the first entry.
 */
export function after({ map }: { map: Map<string, any> }) {
	if (map.size > 128) {
		map.delete(map.keys().next().value);
	}
}
