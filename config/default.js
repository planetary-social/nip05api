// Make production env explicit, no defaults
// istanbul ignore next
if (process.env.NODE_ENV === "production") {
  if (!process.env.AUTH_PUBKEY) {
    throw new Error("AUTH_PUBKEY environment variable is not set");
  }

  if (!process.env.ROOT_DOMAIN) {
    throw new Error("ROOT_DOMAIN environment variable is not set");
  }

  if (!process.env.REDIS_HOST) {
    throw new Error("REDIS_HOST environment variable is not set");
  }
}

export default {
  latestEntriesCount: 10,
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  slackCron: process.env.SLACK_CRON || "*/10 * * * *",
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    remote_host: process.env.REMOTE_REDIS_URL || "redis://redis:6379",
  },
  logLevel: "info",
  rootDomain: process.env.ROOT_DOMAIN || "nos.social",
  port: 3000,
  nip98TtlSeconds: 60,
  servicePubkey:
    process.env.AUTH_PUBKEY ||
    "6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2",
};
