import type fetch from "cross-fetch";
import type {
	BaseAuthenticationCredentials,
	Info,
	Item,
	List,
	SearchResult,
} from "@theatrex/types";

export class Connector<T extends BaseAuthenticationCredentials> {
	protected readonly url: string;
	protected readonly auth: T;
	protected _token?: string;
	public readonly prefix: string;
	public fetch: typeof fetch;

	constructor(
		{ url, auth, prefix }: { url: string; auth: T; prefix?: string },
		fetch = window.fetch,
	) {
		this.url = url.replace(/\/+$/, "");
		this.prefix = prefix || this.url.replace(/[^a-zA-Z0-9]/g, "");
		this.auth = auth;
		this.fetch = fetch;
	}

	public get token(): string | undefined {
		return this._token;
	}

	private patch(obj: any) {
		if (Array.isArray(obj)) {
			for (const item of obj) {
				this.patch(item);
			}
		} else if (typeof obj === "object" && obj !== null) {
			if ("id" in obj && typeof obj.id === "string") {
				obj.id = `${this.prefix}::${obj.id}`;
			}

			for (const key in obj) {
				this.patch(obj[key]);
			}
		}

		return obj;
	}

	protected _info?: Info<T>;
	protected _info_expirs = 0;
	public async info(): Promise<Info<T>> {
		if (this._info && this._info_expirs > Date.now()) {
			return this._info;
		}

		const res = await this.fetch(`${this.url}/info`);

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		this._info = this.patch(await res.json());
		this._info_expirs = Date.now() + 1000 * 60 * 60;
		return this._info as Info<T>;
	}

	public async check(): Promise<[ok: boolean, missing: [key: string, reason: string][]]> {
		const info = await this.info();

		const missing = Object.entries(info.auth).filter(([key]) => !(key in this.auth));

		return [missing.length === 0, missing];
	}

	public async authenticate(): Promise<string> {
		const res = await this.fetch(`${this.url}/auth`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(this.auth),
		});

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		const { token } = await res.json();

		this._token = token;

		return token;
	}

	public async search(query: string): Promise<SearchResult[]> {
		const res = await this.fetch(`${this.url}/search?query=${encodeURIComponent(query)}`, {
			headers: {
				Authorization: this._token || "",
			},
		});

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		return this.patch(await res.json());
	}

	public async list(id: string): Promise<List> {
		const res = await this.fetch(`${this.url}/list/${encodeURIComponent(id)}`, {
			headers: {
				Authorization: this._token || "",
			},
		});

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		return this.patch(await res.json());
	}

	public async item(id: string): Promise<Item<true>> {
		const res = await this.fetch(`${this.url}/item/${encodeURIComponent(id)}`, {
			headers: {
				Authorization: this._token || "",
			},
		});

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		return this.patch(await res.json());
	}

	public resloc(id: string): string {
		return `${this.url}/resource/${encodeURIComponent(id)}`;
	}

	public async resource(id: string): Promise<ReadableStream<Uint8Array> | null> {
		const res = await this.fetch(this.resloc(id), {
			headers: {
				Authorization: this._token || "",
			},
		});

		if (!res.ok) {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}

		return res.body;
	}
}
