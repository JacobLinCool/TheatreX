import sse from "$lib/server/event";
import { watcher } from "$lib/server/notification";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
	const name = url.searchParams.get("name") || "";
	if (!name) {
		return new Response("Invalid name", { status: 400 });
	}

	if (name === "notification") {
		watcher.start();
	}

	const event = sse.get(name);
	const id = Math.random().toString(36).substring(2);

	const stream = new ReadableStream({
		start: (controller) => {
			event.subscribe(id, controller);
		},
		cancel: () => {
			event.unsubscribe(id);
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			Connection: "keep-alive",
			"Cache-Control": "no-cache",
		},
	});
};
