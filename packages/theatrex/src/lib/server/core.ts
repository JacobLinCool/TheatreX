import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import path from "node:path";
import { Connector } from "@theatrex/connector";
import type { TheatrexConfig } from "@theatrex/types";
import package_json from "../../../package.json";
import Sentry from "../../sentry";
import { config, save } from "./config";
import fs from "./fs";
import log from "./log";
import { port_hash, normalize } from "./utils";

const locals = new Map<string, { port: number; child: ChildProcess }>();

process.on("exit", () => {
	for (const { child } of locals.values()) {
		child.kill();
	}
});
process.on("SIGINT", () => {
	process.exit(0);
});
process.on("SIGTERM", () => {
	process.exit(0);
});

let local_barriers = Promise.resolve();

export const core = {
	version: package_json.version,
	providers: providers(),
	update(new_config: TheatrexConfig) {
		save(new_config);
		core.reload();
	},
	reload() {
		core.providers = providers();
		log("core reloaded");
	},
	get authenticated() {
		return local_barriers.then(() =>
			Promise.all(
				core.providers
					.filter((p) => p.token === undefined)
					.map((p) => Promise.all([p.info(), p.authenticate()])),
			).then(() => true),
		);
	},
};

function providers() {
	const uses = config().providers.map((p) => p.use);

	for (const [prefix, { child }] of locals) {
		if (!uses.includes(prefix)) {
			child.kill();
			locals.delete(prefix);
			log(`killed ${prefix}`);
		}
	}

	for (let use of uses) {
		try {
			new URL(use);
		} catch {
			use = normalize(use);
			if (!locals.has(use)) {
				const port = 20000 + port_hash(use);
				const child = run(use);

				child.on("error", (error) => {
					log(`error ${use}`, error);
				});

				child.once("exit", (code) => {
					log(`exited ${use}`, code);
				});

				locals.set(use, { port, child });
				log(`spawned ${use} on port ${port}`);

				local_barriers = local_barriers.then(
					() =>
						new Promise((resolve) => {
							const file = fs.logs.provider[port][new Date().toISOString()];
							file.$data = "";
							const stream = file.$fs.createWriteStream();
							log(`logging ${use} to ${file.$path}`);
							const print = (data: Buffer) => {
								const out = data.toString();
								stream.write(out);
							};
							let resolver = (data: Buffer) => {
								print(data);
								if (data.toString().toLowerCase().includes("provider ready")) {
									resolve();
									resolver = print;
								}
							};
							child.stdout.on("data", resolver);
							child.stderr.on("data", resolver);

							child.once("exit", (code) => {
								resolve();
							});
						}),
				);
			}
		}
	}

	return config().providers.map((provider) => {
		const local = locals.get(normalize(provider.use));

		const connector = new Connector(
			{
				url: local ? `http://localhost:${local.port}` : provider.use,
				auth: provider.auth,
			},
			fetch,
		);

		for (const method of Object.keys(connector) as (keyof typeof Connector)[]) {
			// @ts-expect-error
			const original = connector[method];
			if (typeof original === "function") {
				// @ts-expect-error
				connector[method] = (...args: any[]) => {
					try {
						return original.bind(connector)(...args);
					} catch (err) {
						Sentry.captureException(err);
						throw err;
					}
				};
			}
		}

		return connector;
	});
}

function run(use: string): ChildProcessWithoutNullStreams {
	const port = 20000 + port_hash(use);

	const options = {
		stdio: "pipe",
		env: {
			...process.env,
			PORT: port.toString(),
			STORE: path.join(path.dirname(use), ".store"),
		},
		cwd: path.dirname(use),
	} as const;

	try {
		const child = spawn(use, options);
		if (child.pid) {
			return child;
		}
	} catch (err) {
		log("Unable to directly spawn", use, err);
	}

	try {
		const child = spawn(process.execPath, [use], options);
		if (child.pid) {
			return child;
		}
	} catch (err) {
		log("Unable to spawn", use, "with node", err);
	}

	throw new Error(`Unable to spawn ${use}`);
}

export default core;
