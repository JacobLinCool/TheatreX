import shell from "shelljs";
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
	async onSuccess() {
		shell.sed("-i", /"524288"/g, `"134217728"`, "dist/index.mjs");
		return () => {
			console.log("Done!");
		};
	},
}));
