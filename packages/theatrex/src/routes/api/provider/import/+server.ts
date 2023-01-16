import crypto from "node:crypto";
import os from "node:os";
import fs from "$lib/server/fs";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request }) => {
	const form = await request.formData();
	const file = form.get("file") as File;
	const name = file.name;
	const buffer = await file.arrayBuffer();
	const hash = crypto.createHash("sha256").update(new Uint8Array(buffer)).digest("hex");

	if (!hash.startsWith(name)) {
		return json({ error: "File hash mismatch" });
	}

	fs["local-provider"][name].provider.$data = arraybuffer_to_buffer(buffer);
	fs["local-provider"][name].provider.$fs.chmodSync(0o755);

	return json({ path: fs["local-provider"][name].provider.$path.replace(os.homedir(), "~") });
};

function arraybuffer_to_buffer(ab: ArrayBuffer): Buffer {
	const buffer = Buffer.alloc(ab.byteLength);
	const view = new Uint8Array(ab);
	for (let i = 0; i < buffer.length; ++i) {
		buffer[i] = view[i];
	}
	return buffer;
}
