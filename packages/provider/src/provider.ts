import { randomUUID } from "node:crypto";
import EventEmitter from "node:events";
import { createServer } from "node:http";
import type { Server as HttpServer } from "node:http";
import debug from "debug";
import Koa from "koa";
import type { Context } from "koa";
import { koaBody } from "koa-body";
import { z } from "zod";
import Router from "@koa/router";
import { filestore } from "@theatrex/store-file";
import { mapstore } from "@theatrex/store-map";
import type {
	Store,
	BaseAuthenticationCredentials,
	AuthenticationHandler,
	SearchHandler,
	ResourceHandler,
	ItemHandler,
	ListHandler,
	InfoHandler,
} from "@theatrex/types";
import { pkg } from "./package";

export class Provider<
	AuthenticationCredentials extends BaseAuthenticationCredentials,
> extends EventEmitter {
	protected dev: boolean;
	protected log: debug.Debugger;
	protected server: HttpServer;
	protected app: Koa;
	protected router: Router;
	protected _store: Store;
	protected _auth: AuthenticationHandler<AuthenticationCredentials>;
	protected _search: SearchHandler<AuthenticationCredentials>;
	protected _resource: ResourceHandler<AuthenticationCredentials>;
	protected _item: ItemHandler<AuthenticationCredentials>;
	protected _list: ListHandler<AuthenticationCredentials>;
	protected _info: InfoHandler<AuthenticationCredentials>;

	constructor({
		dev = false,
		name = "theatrex:provider",
		store = process.env.STORE ? filestore(process.env.STORE) : mapstore(),
	} = {}) {
		super();
		this.dev = dev;
		this.app = new Koa();
		this.router = new Router();
		this.server = createServer(this.app.callback());
		this._store = store;
		this._auth = async () => true;
		this._search = async () => [];
		this._resource = async () => undefined;
		this._item = async () => undefined;
		this._list = async () => ({ id: "", name: "", items: [] });
		this._info = async () => ({
			id: "provider",
			name: "Provider",
			auth: {
				username: "An user identifier",
			} as { [key in keyof AuthenticationCredentials]: string },
			tabs: [],
		});

		this.log = debug(name);
		debug.enable(`${name}*`);
		if (this.dev) {
			this.log("dev mode enabled");
		}

		this.setup();
	}

	protected setup(): void {
		const validate_log = this.log.extend("validate");
		const validate = async (ctx: Context) => {
			if (this.dev) {
				return { user: { username: "DEV" }, token: "DEV" } as {
					user: AuthenticationCredentials;
					token: string;
				};
			}

			const token = ctx.request.headers.authorization;
			validate_log("token: %s", token);
			if (!token) {
				ctx.status = 401;
				ctx.body = "Unauthorized, missing token";
				return;
			}

			const user = await this._store.space("auth").get(token);
			validate_log("username: %s", user?.username);
			if (!user) {
				ctx.status = 401;
				ctx.body = "Unauthorized, invalid token";
				return;
			}

			return { user, token } as { user: AuthenticationCredentials; token: string };
		};

		this.router
			.post("/auth", async (ctx, next) => {
				const body = ctx.request.body as AuthenticationCredentials;
				const ok = await this._auth({ ...body, ctx });
				if (!ok) {
					ctx.status = 401;
					ctx.body = "Unauthorized";
					return;
				}

				const token = randomUUID();
				await this._store.space("auth").set(token, body);

				ctx.body = { token };

				await next();
			})
			.get("/search", async (ctx, next) => {
				const auth = await validate(ctx);
				if (!auth) {
					return;
				}

				const query = z.string().min(1).max(512).parse(ctx.request.query?.query);

				ctx.body = await this._search({
					query,
					auth,
					store: this._store,
					ctx,
				});

				await next();
			})
			.get("/resource/:id*", async (ctx, next) => {
				const auth = await validate(ctx);
				if (!auth) {
					return;
				}

				const id = ctx.params.id as string;

				const result = await this._resource({
					id,
					auth,
					store: this._store,
					ctx,
				});

				if (typeof result === "string" || result instanceof Buffer) {
					ctx.body = result;
					await next();
					return;
				}
				if (result instanceof URL) {
					ctx.redirect(result.toString());
					await next();
					return;
				}
				if (result && "pipe" in result) {
					ctx.body = result;
					await next();
					return;
				}

				ctx.status = 404;
				ctx.body = "Not found";
				await next();
			})
			.get("/item/:id*", async (ctx, next) => {
				const auth = await validate(ctx);
				if (!auth) {
					return;
				}

				const id = ctx.params.id as string;

				ctx.body = await this._item({
					id,
					auth,
					store: this._store,
					ctx,
				});

				await next();
			})
			.get("/list/:id*", async (ctx, next) => {
				const auth = await validate(ctx);
				if (!auth) {
					return;
				}

				const id = ctx.params.id as string;

				ctx.body = await this._list({
					id,
					auth,
					store: this._store,
					ctx,
				});

				await next();
			})
			.get("/info", async (ctx, next) => {
				const result = await this._info({
					store: this._store,
					ctx,
				});

				ctx.body = {
					version: pkg.version,
					...result,
				};

				await next();
			});

		const router_log = this.log.extend("router");
		this.app
			.use(async (ctx, next) => {
				const start = Date.now();
				await next();
				const ms = Date.now() - start;
				router_log(`${ctx.method} ${ctx.url} ${ctx.status} - ${ms}ms`);
			})
			.use(async (ctx, next) => {
				try {
					await next();
				} catch (err) {
					if (err instanceof z.ZodError) {
						ctx.status = 400;
						ctx.body = err.message;
					} else if (err instanceof Error) {
						ctx.status = 500;
						ctx.body = err.message;
					}
				}
			})
			.use(async (ctx, next) => {
				ctx.set("Access-Control-Allow-Origin", "*");
				ctx.set("Access-Control-Allow-Headers", "Authorization");
				ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
				await next();
			})
			.use(koaBody())
			.use(this.router.routes())
			.use(this.router.allowedMethods());
	}

	public store(store: Store): this {
		this._store = store;
		return this;
	}

	public auth(handler: AuthenticationHandler<AuthenticationCredentials>): this {
		this._auth = handler;
		return this;
	}

	public search(handler: SearchHandler<AuthenticationCredentials>): this {
		this._search = handler;
		return this;
	}

	public resource(handler: ResourceHandler<AuthenticationCredentials>): this {
		this._resource = handler;
		return this;
	}

	public item(handler: ItemHandler<AuthenticationCredentials>): this {
		this._item = handler;
		return this;
	}

	public list(handler: ListHandler<AuthenticationCredentials>): this {
		this._list = handler;
		return this;
	}

	public info(handler: InfoHandler<AuthenticationCredentials>): this {
		this._info = handler;
		return this;
	}

	public async start(port: number): Promise<void> {
		await this._store.prune();
		await new Promise<void>((resolve, reject) => {
			try {
				this.server.listen(port, resolve);
			} catch (err) {
				reject(err);
			}
		});
		this.log(`provider ready on port ${port}`);
		this.log("env", { PORT: process.env.PORT, STORE: process.env.STORE });
	}

	public stop(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.server.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
