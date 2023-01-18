export class SSECore {
	public clients = new Map<string, ReadableStreamDefaultController>();

	public send(data: { type: string; [key: string]: any }) {
		this.clients.forEach((client) => {
			client.enqueue(`data: ${JSON.stringify(data)}\n\n`);
		});
	}

	public async subscribe(id: string, stream: ReadableStreamDefaultController) {
		this.clients.set(id, stream);
		stream.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
	}

	public unsubscribe(id: string) {
		this.clients.delete(id);
	}
}

export class SSE {
	public events = new Map<string, SSECore>();

	public get(event: string) {
		if (!this.events.has(event)) {
			this.events.set(event, new SSECore());
		}

		return this.events.get(event) as SSECore;
	}
}

export const sse = new SSE();
export default sse;

setInterval(() => {
	sse.get("ping").send({ type: "alive", time: Date.now() });
}, 1000 * 10);
