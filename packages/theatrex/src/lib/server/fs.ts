import os from "node:os";
import path from "node:path";
import { mount, File, serializer, z } from "controlled-fs";
import yaml from "js-yaml";
import type { TheatrexConfig, List } from "@theatrex/types";

export const config_schema: z.ZodSchema<TheatrexConfig> = z.object({
	providers: z.array(
		z.object({
			use: z.string(),
			auth: z
				.object({
					username: z.string(),
				})
				.and(z.record(z.string())),
		}),
	),
});

export const list_schema: z.ZodSchema<List> = z.object({
	id: z.string(),
	name: z.string(),
	items: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			cover: z.string(),
		}),
	),
});

export const history_schema = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		cover: z.string(),
		watched: z.number(),
	}),
);

export const state_schema = z.record(
	z.string().describe("episode id"),
	z.object({
		watched: z.number().describe("watched time in seconds"),
		total: z.number().describe("total time in seconds"),
	}),
);

const structure = z.object({
	"config.yaml": File(
		config_schema,
		(config) => Buffer.from(yaml.dump(config, { indent: 4 })),
		(buffer) => config_schema.parse(yaml.load(buffer.toString())),
	),

	lists: z.record(z.string(), File(list_schema, ...serializer.json)),

	state: z.record(
		z.string().describe("provider prefix"),
		z.record(z.string().describe("item id"), File(state_schema, ...serializer.json)),
	),

	history: z.object({
		"recent.json": File(history_schema, ...serializer.json),
		timeline: z.record(
			z.string().regex(/^\d{4}-\d{2}$/),
			File(history_schema, ...serializer.json),
		),
	}),

	logs: z.object({
		client: z.record(z.string(), File(z.string(), ...serializer.string)),
		provider: z.record(
			z.string(),
			z.record(z.string(), File(z.string(), ...serializer.string)),
		),
	}),

	"local-provider": z.record(
		z.string().describe("provider hash"),
		z.object({
			provider: File(z.instanceof(Buffer), ...serializer.buffer),
			store: z.record(z.string(), File(z.instanceof(Buffer), ...serializer.buffer)),
		}),
	),

	".snapshots": z.record(
		z.string().describe("provider prefix"),
		z.record(
			z.string().describe("item id"),
			File(z.object({ count: z.number() }), ...serializer.json),
		),
	),
});

export const fs = mount(path.join(os.homedir(), ".theatrex"), structure);

export default fs;
