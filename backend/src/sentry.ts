// Lightweight Sentry wrapper for backend
const SENTRY_DSN = process.env.SENTRY_DSN;
const captureException = (err: Error) => { if (SENTRY_DSN) console.error("[Sentry]", err.message); };
const captureMessage = (msg: string) => { if (SENTRY_DSN) console.info("[Sentry]", msg); };
export default { captureException, captureMessage };