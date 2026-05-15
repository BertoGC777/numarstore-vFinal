import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || "production",
  integrations: [],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

export default Sentry;