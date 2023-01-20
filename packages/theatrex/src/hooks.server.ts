import type { Handle, HandleServerError } from "@sveltejs/kit";
import Sentry from "./sentry";

export const handle: Handle = async ({ event, resolve }) => {
	const res = await resolve(event);
	return res;
};

export const handleError: HandleServerError = async ({ error, event }) => {
	const id = Sentry.captureException(error);

	return {
		message: `Unexpected Error! You can report this error with the following ID: ${id}`,
	};
};

process
	.on("unhandledRejection", (reason) => {
		Sentry.captureException(reason);
		process.exit(1);
	})
	.on("uncaughtException", (error) => {
		Sentry.captureException(error);
		process.exit(1);
	});
