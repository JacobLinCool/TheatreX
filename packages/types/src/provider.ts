import type { Context } from "koa";
import type { Store } from "./store";

export type AuthenticationHandler<T extends BaseAuthenticationCredentials> = (
	data: T & { ctx: Context },
) => Promise<boolean>;

export interface AuthenticatedUser<T extends BaseAuthenticationCredentials> {
	user: T;
	token: string;
}

export type SearchHandler<T extends BaseAuthenticationCredentials> = (data: {
	query: string;
	auth: AuthenticatedUser<T>;
	store: Store;
	ctx: Context;
}) => Promise<SearchResult[]>;

/**
 * @returns `Buffer` or `string` for binary data, `URL` for redirect `undefined` for 404
 */
export type ResourceHandler<T extends BaseAuthenticationCredentials> = (data: {
	id: string;
	auth: AuthenticatedUser<T>;
	store: Store;
	ctx: Context;
}) => Promise<Buffer | URL | string | undefined>;

export type ItemHandler<T extends BaseAuthenticationCredentials> = (data: {
	id: string;
	auth: AuthenticatedUser<T>;
	store: Store;
	ctx: Context;
}) => Promise<Item | undefined>;

export type ListHandler<T extends BaseAuthenticationCredentials> = (data: {
	id: string;
	auth: AuthenticatedUser<T>;
	store: Store;
	ctx: Context;
}) => Promise<List>;

export type InfoHandler<T extends BaseAuthenticationCredentials> = (data: {
	auth?: AuthenticatedUser<T>;
	store: Store;
	ctx: Context;
}) => Promise<Info<T>>;

export interface BaseAuthenticationCredentials {
	username: string;
}

export interface PasswordAuthenticationCredentials extends BaseAuthenticationCredentials {
	password: string;
}

export type HydratedEpisode = {
	watched: number;
	total: number;
};

export type Episode<Hydrated = false> = {
	id: string;
	name: string;
	description: string;
} & (Hydrated extends true ? HydratedEpisode : {});

export interface Season<Hydrated = false> {
	name: string;
	description: string;
	episodes: Episode<Hydrated>[];
}

export interface Item<Hydrated = false> {
	id: string;
	name: string;
	cover: string;
	description: string;
	tags: string[];
	seasons: Season<Hydrated>[];
}

export type ListItem = Omit<Item, "description" | "tags" | "seasons">;

export interface List {
	id: string;
	name: string;
	items: ListItem[];
}

export interface SearchResult extends ListItem {
	score: number;
}

export interface Tab {
	name: string;
	lists: string[];
}

export interface Info<T extends BaseAuthenticationCredentials> {
	name: string;
	auth: {
		[key in keyof T]: string;
	};
	tabs: Tab[];
}
