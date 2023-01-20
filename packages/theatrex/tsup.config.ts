import fs from "node:fs";
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
		let content = fs.readFileSync("dist/index.mjs", "utf8");
		content = content
			.replace(/"524288"/g, `"134217728"`)
			.replace(
				`throw new Error('Dynamic require of "' + x + '" is not supported')`,
				`if (__injected_require[x]) return __injected_require[x];\nthrow new Error('Dynamic require of "' + x + '" is not supported')`,
			);
		const injection = fs.readFileSync("src/server/injection.ts", "utf8");
		fs.writeFileSync("dist/index.mjs", [injection, content].join("\n"));
		return () => {
			console.log("Done!");
		};
	},
}));
