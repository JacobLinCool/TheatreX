import { defineConfig } from "tsup";

export default defineConfig(() => ({
	entry: ["src/index.ts"],
	outDir: "dist",
	target: "node16",
	format: ["esm", "cjs"],
	shims: true,
	clean: true,
	splitting: false,
	dts: true,
}));
