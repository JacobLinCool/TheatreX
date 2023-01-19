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
	public prefix: string;
	public fetch: typeof fetch;

	constructor(
		{ url, auth, prefix }: { url: string; auth: T; prefix?: string },
		fetch = window.fetch,
	) {
		this.url = url.replace(/\/+$/, "");
		this.prefix = prefix || this.url.replace(/[^a-zA-Z0-9]/g, "");
		this.auth = auth;
		this.fetch = async (...args: Parameters<typeof fetch>) => {
			return fetch(args[0], {
				...args[1],
				headers: {
					Authorization: this._token || "",
					...args[1]?.headers,
				},
			}).catch((err) => {
				throw new Error(`Failed to fetch ${args[0]}: ${err.message}`);
			});
		};
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
			if ("res" in obj && typeof obj.res === "string") {
				obj.res = `${this.prefix}::${obj.res}`;
			}
			if ("cover" in obj && typeof obj.cover === "string") {
				obj.cover = new URL(obj.cover, this.url).href
					.replace("/resource/", "")
					.replace(this.url, "/api/resource/" + this.prefix + "::");
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
		await this.handle_error(res);

		this._info = (await res.json()) as Info<T>;
		this.prefix = this._info.id;
		this._info_expirs = Date.now() + 1000 * 60 * 60;
		return this._info;
	}

	public async check(): Promise<[ok: boolean, missing: [key: string, reason: string][]]> {
		const info = await this.info();

		const missing = Object.entries(info.auth).filter(([key]) => !(key in this.auth));

		return [missing.length === 0, missing];
	}

	public async authenticate(): Promise<string> {
		const res = await this.fetch(`${this.url}/auth`, {
			method: "POST",
			body: JSON.stringify(this.auth),
		});
		await this.handle_error(res);

		const { token } = await res.json();

		this._token = token;

		return token;
	}

	public async search(query: string): Promise<SearchResult[]> {
		const res = await this.fetch(`${this.url}/search?query=${encodeURIComponent(query)}`);
		await this.handle_error(res);

		return this.patch(await res.json());
	}

	public async list(id: string): Promise<List> {
		const res = await this.fetch(`${this.url}/list/${encodeURIComponent(id)}`);
		await this.handle_error(res);

		return this.patch(await res.json());
	}

	public async item(id: string): Promise<Item<true>> {
		const res = await this.fetch(`${this.url}/item/${encodeURIComponent(id)}`);
		await this.handle_error(res);

		return this.patch(await res.json());
	}

	public resloc(id: string): string {
		return `${this.url}/resource/${encodeURIComponent(id)}`;
	}

	public async resource(id: string): Promise<ReadableStream<Uint8Array> | null> {
		const res = await this.fetch(this.resloc(id));
		await this.handle_error(res);

		return res.body;
	}

	protected async handle_error(res: Response) {
		if (res.ok) {
			return;
		}

		if (res.status === 401) {
			for (let i = 0; i < 2; i++) {
				try {
					await this.authenticate();
					return;
				} catch {}
			}
			throw new Error("Authentication failed");
		} else if (res.status === 404) {
			throw new Error("Not found");
		} else {
			throw new Error(`Request failed: ${res.status} ${res.statusText}`);
		}
	}
}
