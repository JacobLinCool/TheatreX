import ReconnectingEventSource from "reconnecting-eventsource";

export class Event {
	public source: ReconnectingEventSource;

	constructor(name: string) {
		this.source = new ReconnectingEventSource(`/api/event?name=${name}`);
	}

	public listen(callback: (data: { type: string; [key: string]: any }) => void) {
		this.source.addEventListener("message", (evt) => {
			callback(JSON.parse(evt.data));
		});
	}
}
