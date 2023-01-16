import { defineConfig } from "tsup";

export default defineConfig(() => ({
	entry: ["build/index.js"],
	outDir: "dist",
	target: "node16",
	format: ["esm"],
	clean: true,
	splitting: false,
	outExtension() {
		return { js: ".mjs" };
	},
}));
