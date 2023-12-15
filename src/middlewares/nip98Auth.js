import { validateEvent, verifySignature } from "nostr-tools";
import crypto from "crypto";
import asyncHandler from "./asyncHandler.js";
import { AppError, UNAUTHORIZED_STATUS } from "../errors.js";
import config from "../../config/index.js";

const NIP98_EVENT_KIND = 27235;
export default function nip98Auth(customRule) {
  return asyncHandler("nip98Auth", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        401,
        "NIP-98 Authentication required. See https://github.com/nostr-protocol/nips/blob/master/98.md"
      );
    }

    const base64Encoded = authHeader.split(" ")[1];
    const eventJSON = base64Encoded
      ? Buffer.from(base64Encoded, "base64").toString()
      : "{}";
    const event = JSON.parse(eventJSON);

    validateNip98Event(event, req);
    if (customRule) {
      await customRule(event, req);
    } else {
      logger.warn("No custom NIP-98 authentication rule specified. It is recommended to restrict the endpoint through some pubkey based rules.");
    }

    req.nip98AuthEvent = event;
  });
}

function validateNip98Event(event, req) {
  validateEventKind(event);
  validateEventTimestamp(event);
  validateEventUrl(event, req);
  validateEventMethod(event, req);
  validateOptionalRequestBodyHash(event, req);

  if (!validateEvent(event)) {
    throw new AppError(UNAUTHORIZED_STATUS, "NIP-98: Invalid event structure.");
  }

  if (!verifySignature(event)) {
    throw new AppError(UNAUTHORIZED_STATUS, "NIP-98: Invalid signature.");
  }
}

function validateEventKind(event) {
  if (event.kind !== NIP98_EVENT_KIND) {
    throw new AppError(UNAUTHORIZED_STATUS, "NIP-98: Invalid event kind.");
  }
}

function validateEventTimestamp(event) {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  if (
    Math.abs(event.created_at - currentTimeInSeconds) > config.nip98TtlSeconds
  ) {
    throw new AppError(
      UNAUTHORIZED_STATUS,
      "NIP-98: Event timestamp is out of the valid time window."
    );
  }
}

function validateEventUrl(event, req) {
  const fullUrl =
    `${req.protocol}` + "://" + `${req.get("host")}${req.originalUrl}`;

  const eventUrl = event.tags.find((tag) => tag[0] === "u")?.[1];

  if (!eventUrl || eventUrl !== fullUrl) {
    throw new AppError(
      UNAUTHORIZED_STATUS,
      `NIP-98: URL mismatch. Received '${eventUrl}' expected '${fullUrl}'.`
    );
  }
}

function validateEventMethod(event, req) {
  const eventMethod = event.tags.find((tag) => tag[0] === "method")?.[1];

  if (!eventMethod || eventMethod !== req.method) {
    throw new AppError(
      UNAUTHORIZED_STATUS,
      `NIP-98: HTTP method mismatch. Received '${eventMethod}' expected '${req.method}'.`
    );
  }
}

function validateOptionalRequestBodyHash(event, req) {
  const eventPayload = event.tags.find((tag) => tag[0] === "payload")?.[1];

  if (!eventPayload || !["POST", "PUT", "PATCH"].includes(req.method)) {
    return;
  }

  const requestBodyHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (eventPayload !== requestBodyHash) {
    throw new AppError(
      UNAUTHORIZED_STATUS,
      "NIP-98: Request body hash mismatch."
    );
  }
}
