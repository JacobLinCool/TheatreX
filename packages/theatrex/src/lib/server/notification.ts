import core from "./core";
import sse from "./event";
import fs from "./fs";
import log from "./log";

export async function take_snapshot(prefix: string, item: string) {
	const provider = core.providers.find((p) => p.prefix === prefix);
	if (!provider) {
		throw new Error(`Provider ${prefix} not found`);
	}

	const data = await provider.item(item);
	const count = data.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

	fs[".snapshots"][prefix][item].$data = { count };
}

export async function update_snapshot(prefix: string, item: string) {
	const provider = core.providers.find((p) => p.prefix === prefix);
	if (!provider) {
		throw new Error(`Provider ${prefix} not found`);
	}

	const data = await provider.item(item);
	const count = data.seasons.reduce((acc, s) => acc + s.episodes.length, 0);

	const old = fs[".snapshots"][prefix][item].$data?.count ?? 0;
	fs[".snapshots"][prefix][item].$data = { count };

	return { item: data, diff: count - old };
}

const debug = log.extend("notification");

class Watcher {
	protected _id: NodeJS.Timer | null = null;
	protected _interval = 1000 * 60 * 5;

	public start() {
		if (this._id) {
			return;
		}
		this._id = setInterval(() => this.check(), this._interval);
		debug("watcher started");
		this.check();
	}

	public stop() {
		if (!this._id) {
			return;
		}
		clearInterval(this._id);
		this._id = null;
	}

	protected async check() {
		const prefixes = fs[".snapshots"].$list();

		sse.get("notification").send({ type: "check-start" });
		debug("check start");

		for (const prefix of prefixes) {
			const provider = core.providers.find((p) => p.prefix === prefix);
			if (!provider) {
				continue;
			}

			const items = fs[".snapshots"][prefix].$list();
			for (const item of items) {
				const { item: target, diff } = await update_snapshot(prefix, item);
				if (diff > 0) {
					sse.get("notification").send({
						type: "notify",
						title: "New Episode Available!",
						content: target.name,
						icon: target.cover,
					});
					debug("notify", target.name);
				}
			}
		}

		sse.get("notification").send({ type: "check-done" });
		debug("check done");
	}
}

export const watcher = new Watcher();
