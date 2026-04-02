// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: "https://25c32f7583f58ad65fdc89d93962a511@o4511149679116288.ingest.de.sentry.io/4511149961445456",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});