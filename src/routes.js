import { Router } from "express";
import asyncHandler from "./middlewares/asyncHandler.js";
import validateSchema from "./middlewares/validateSchema.js";
import extractNip05Name from "./middlewares/extractNip05Name.js";
import logger from "./logger.js";
import { postNip05, nip05QueryName as nip05QueryName } from "./schemas.js";
import nip98Auth from "./middlewares/nip98Auth.js";
import config from "../config/index.js";
import { AppError, UNAUTHORIZED_STATUS } from "./errors.js";

const router = Router();

router.get(
  "/.well-known/nostr.json",
  validateSchema(nip05QueryName),
  extractNip05Name,
  asyncHandler("getNip05", async (req, res) => {
    const name = req.nip05Name;

    const pubkey = await req.redis.get(`pubkey:${name}`);
    if (!pubkey) {
      throw new AppError(404, "Name not found");
    }

    logger.info(`Found pubkey: ${pubkey} for ${name}`);

    const relays = await req.redis.smembers(`relays:${pubkey}`);

    const response = { names: {}, relays: {} };
    response.names[name] = pubkey;
    response.relays[pubkey] = relays;

    res.status(200).json(response);
  })
);

router.post(
  "/.well-known/nostr.json",
  validateSchema(postNip05),
  extractNip05Name,
  nip98Auth(validatePubkey),
  asyncHandler("postNip05", async (req, res) => {
    const {
      data: { pubkey, relays },
    } = req.body;

    const name = req.nip05Name;
    const currentPubkey = await req.redis.get(`pubkey:${name}`);

    if (currentPubkey && currentPubkey !== pubkey) {
      return res
        .status(409)
        .send(
          "Conflict: pubkey already exists, you can only change associated relays."
        );
    }

    const pipeline = req.redis.multi();
    pipeline.set(`pubkey:${name}`, pubkey);
    pipeline.del(`relays:${pubkey}`);
    if (relays?.length) {
      pipeline.sadd(`relays:${pubkey}`, ...relays);
    }

    const result = await pipeline.exec();
    logger.info(`Added ${name} with pubkey ${pubkey}`);

    res.status(200).json();
  })
);

router.delete(
  "/.well-known/nostr.json",
  validateSchema(nip05QueryName),
  extractNip05Name,
  nip98Auth(validatePubkey),
  asyncHandler("deleteNip05", async (req, res) => {
    const name = req.nip05Name;

    const pubkey = await req.redis.get(`pubkey:${name}`);
    if (!pubkey) {
      throw new AppError(404, "Name not found");
    }

    const pipeline = req.redis.multi();
    pipeline.del(`relays:${pubkey}`);
    pipeline.del(`pubkey:${name}`);
    await pipeline.exec();

    logger.info(`Deleted ${name} with pubkey ${pubkey}`);

    res.status(200).json();
  })
);

if (process.env.NODE_ENV === "test") {
  router.get(
    "/test/error",
    validateSchema(nip05QueryName),
    extractNip05Name,
    asyncHandler("testError", async (req, res) => {
      throw new Error("Test error");
    })
  );
}

/**
 * Validates the authentication pubkey for a NIP-98 event based on our application-specific rules.
 *
 * The authentication pubkey must satisfy one of the following conditions:
 * 1. If it matches 'servicePubkey', which we own, there's no need to verify the target
 *    pubkey for the account being modified, any change is allowed by ourselves.
 * 2. If it matches the target pubkey that is being changed, a user's pubkey,
 *    then it must match both the target pubkey stored in our database and the one specified
 *    in the event's body payload.
 *
 * @param {Object} authEvent - The authentication event containing the pubkey.
 * @param {Object} req - The request object, containing NIP05 name and body data.
 * @throws {AppError} - Throws specific error depending on the failed validation criteria.
 */
async function validatePubkey(authEvent, req) {
  const name = req.nip05Name;
  const storedPubkey = await req.redis.get(`pubkey:${name}`);
  const payloadPubkey = req.body?.data?.pubkey;

  const isServicePubkey = authEvent.pubkey === config.servicePubkey;
  const isStoredPubkeyMatch = storedPubkey
    ? authEvent.pubkey === storedPubkey
    : true;
  const isPayloadPubkeyMatch = payloadPubkey
    ? authEvent.pubkey === payloadPubkey
    : true;

  if (!isServicePubkey) {
    if (!isStoredPubkeyMatch) {
      throw new AppError(
        UNAUTHORIZED_STATUS,
        `NIP-98: Authentication pubkey '${authEvent.pubkey}' does not match the stored pubkey '${storedPubkey}'.`
      );
    }
    if (!isPayloadPubkeyMatch) {
      throw new AppError(
        UNAUTHORIZED_STATUS,
        `NIP-98: Authentication pubkey '${authEvent.pubkey}' does not match the payload pubkey '${payloadPubkey}'.`
      );
    }
  }

  if (!isServicePubkey && !(isStoredPubkeyMatch && isPayloadPubkeyMatch)) {
    throw new AppError(
      UNAUTHORIZED_STATUS,
      `NIP-98: Authentication pubkey '${authEvent.pubkey}' is neither the service pubkey '${config.servicePubkey}' nor matches both stored and payload pubkeys.`
    );
  }
}

export default router;
