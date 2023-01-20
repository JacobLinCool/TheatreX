import * as Sentry from "@sentry/node";
import "@sentry/tracing";

Sentry.init({
	dsn: "https://a0082bff293549adb95627f52b42dd5c@o923427.ingest.sentry.io/4504538401996800",
	tracesSampleRate: 1.0,
});

export default Sentry;
