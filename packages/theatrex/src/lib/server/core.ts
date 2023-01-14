import { spawn } from "node:child_process";
import type { ChildProcess } from "node:child_process";
import path from "node:path";
import { Connector } from "@theatrex/connector";
import type { TheatrexConfig } from "@theatrex/types";
import { config, save } from "./config";
import fs from "./fs";
import log from "./log";

const locals = new Map<string, { port: number; child: ChildProcess }>();
process.on("exit", () => {
	for (const { child } of locals.values()) {
		child.kill();
	}
});
let local_barriers = Promise.resolve();

export const core = {
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
					.filter((provider) => typeof provider.token === "undefined")
					.map((provider) => provider.authenticate()),
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

	for (const use of uses) {
		try {
			new URL(use);
		} catch {
			if (!locals.has(use)) {
				const port = 20000 + port_hash(use);

				const options = {
					stdio: "pipe",
					env: {
						DEBUG: process.env.DEBUG || "",
						PATH: process.env.PATH || "",
						PORT: port.toString(),
					},
					cwd: path.dirname(use),
				} as const;
				const child =
					path.extname(use) === ".js"
						? spawn("node", [use], options)
						: spawn(use, options);

				child.on("error", (error) => {
					log(`error ${use}`, error);
				});

				child.once("exit", (code) => {
					log(`exited ${use}`, code);
				});

				locals.set(use, { port, child });
				log(`spawning ${use} on port ${port}`);

				local_barriers = local_barriers.then(
					() =>
						new Promise((resolve) => {
							const file = fs.logs.provider[port][new Date().toISOString()];
							file.$data = "";
							const stream = file.$fs.createWriteStream();
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
						}),
				);
			}
		}
	}

	return config().providers.map((provider) => {
		const local = locals.get(provider.use);

		return new Connector(
			{
				url: local ? `http://localhost:${local.port}` : provider.use,
				auth: provider.auth,
			},
			fetch,
		);
	});
}

export default core;

function port_hash(use: string): number {
	use = use
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "")
		.trim();

	let hash = 0;
	for (let i = 0; i < use.length; i++) {
		hash = (hash << 5) - hash + use.charCodeAt(i);
		hash |= 0;
		hash %= 20011;
	}
	return hash;
}
