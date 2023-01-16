import type { VideoJsPlayer } from "video.js";

export function capture(player: VideoJsPlayer, name = "capture") {
	const video = player.el().querySelector("video");
	if (!video) {
		throw new Error("Could not find video element");
	}

	const canvas = document.createElement("canvas");
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Could not create canvas context");
	}

	ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
	const data = canvas.toDataURL("image/png");

	const a = document.createElement("a");
	a.href = data;
	a.download = name + ".png";
	a.click();
	a.remove();
}
