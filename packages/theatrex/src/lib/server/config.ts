import type { TheatrexConfig } from "@theatrex/types";
import { fs, config_schema } from "./fs";

let _config: TheatrexConfig | undefined;

export function load(): TheatrexConfig {
	try {
		_config = fs["config.yaml"].$data;
		_config = config_schema.parse(_config);
	} catch (err) {
		console.warn("Use default config");
		_config = {
			providers: [],
		};
	}

	return _config;
}

export function config(): TheatrexConfig {
	return _config ?? load();
}

export function save(config: TheatrexConfig): void {
	fs["config.yaml"].$data = config;
	_config = config;
}
