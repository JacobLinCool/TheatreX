import { writable } from "svelte/store";
import type { Item } from "@theatrex/types";

export const current_watching = writable<{ item: Item<true>; id: string } | undefined>(undefined);
