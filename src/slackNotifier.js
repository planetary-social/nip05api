/* istanbul ignore file */
import fetch from "node-fetch";
import config from "../config/index.js";
import logger from "./logger.js";

export default async function fetchAndSendLatestEntries(repo) {
  if (!config.slackWebhookUrl) {
    logger.info("No Slack webhook URL provided. Skipping sending to Slack.");
    return;
  }

  const latestEntries = await repo.findLatest(config.latestEntriesCount);

  const lastSentEntryTimestamp = await repo.getLastSentEntryTimestamp();

  if (
    latestEntries.length === 0 ||
    new Date(latestEntries[0].updatedAt).getTime() <= lastSentEntryTimestamp
  ) {
    logger.info("No new changes to send to Slack.");
    return;
  }

  const message = latestEntries
    .map(
      (entry, index) =>
        `${index + 1}. *Name*: ${entry.name}\n` +
        `> *Pubkey*: ${entry.pubkey}\n` +
        `> *Relays*: ${entry.relays.join(", ")}\n` +
        `> *Client IP*: ${entry.clientIp}\n` +
        `> *User Agent*: ${entry.userAgent}\n` +
        `> *Updated At*: ${entry.updatedAt}`
    )
    .join("\n");

  await sendSlackMessage(`Latest ${latestEntries.length} entries:\n${message}`);
  logger.info("Sent latest entries to Slack.");
  await repo.setLastSentEntryTimestamp(
    new Date(latestEntries[0].updatedAt).getTime()
  );
}

async function sendSlackMessage(message) {
  try {
    const response = await fetch(config.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`Failed to send message to Slack: ${errorBody}`);
    }
  } catch (error) {
    logger.error(`Error sending message to Slack: ${error.message}`);
  }
}
