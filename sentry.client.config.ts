import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://examplePublicKey@o0.ingest.sentry.io/0",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  // Se activa automáticamente cuando se configure un DSN real de Sentry
  enabled: Boolean(
    process.env.NEXT_PUBLIC_SENTRY_DSN &&
      !process.env.NEXT_PUBLIC_SENTRY_DSN.includes("examplePublicKey")
  ),
});
