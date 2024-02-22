import { Router } from "express";
import asyncHandler from "./middlewares/asyncHandler.js";
import validateSchema from "./middlewares/validateSchema.js";
import extractNip05Name from "./middlewares/extractNip05Name.js";
import logger from "./logger.js";
import { postNip05, nip05QueryName, nip05ParamsName } from "./schemas.js";
import nip98Auth from "./middlewares/nip98Auth.js";
import config from "../config/index.js";
import { AppError, UNAUTHORIZED_STATUS } from "./errors.js";
import NameRecord from "./nameRecord.js";

const router = Router();

router.get(
  "/.well-known/nostr.json",
  validateSchema(nip05QueryName),
  extractNip05Name,
  asyncHandler("getNip05", async (req, res) => {
    const nameRecord = await req.nameRecordRepo.findByName(req.nip05Name);

    if (!nameRecord) {
      throw new AppError(404, `Name ${req.nip05Name} not found`);
    }

    const response = {
      names: { [nameRecord.name]: nameRecord.pubkey },
      relays: { [nameRecord.pubkey]: nameRecord.relays },
    };

    res.status(200).json(response);
  })
);

router.post(
  "/api/names",
  validateSchema(postNip05),
  extractNip05Name,
  nip98Auth(validatePubkey),
  asyncHandler("postNip05", async (req, res) => {
    const {
      data: { pubkey, relays },
    } = req.body;
    const name = req.nip05Name;
    const clientIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const nameRecord = new NameRecord(
      name,
      pubkey,
      relays,
      clientIp,
      userAgent
    );
    await req.nameRecordRepo.save(nameRecord);

    logger.info(`Added/Updated ${name} with pubkey ${pubkey}`);
    res.status(200).json({ message: "Name record saved successfully." });
  })
);

router.delete(
  "/api/names/:name",
  validateSchema(nip05ParamsName),
  extractNip05Name,
  nip98Auth(validatePubkey),
  asyncHandler("deleteNip05", async (req, res) => {
    const name = req.nip05Name;
    const deleted = await req.nameRecordRepo.deleteByName(name);

    if (!deleted) {
      throw new AppError(404, "Name not found");
    }

    logger.info(`Deleted ${name}`);
    res.status(200).json({ message: "Name record deleted successfully." });
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
  const storedPubkey = await req.nameRecordRepo.findByName(name).pubkey;
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
