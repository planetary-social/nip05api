import { Router } from "express";
import asyncHandler from "./middlewares/asyncHandler.js";
import validateSchema from "./middlewares/validateSchema.js";
import extractSubdomains from "./middlewares/extractSubdomains.js";
import logger from "./logger.js";
import { postNip05, getNip05 } from "./schemas.js";
import nip98Auth from "./middlewares/nip98Auth.js";
import { AppError } from "./errors.js";

const router = Router();

router.post(
  "/.well-known/nostr.json",
  nip98Auth,
  validateSchema(postNip05),
  asyncHandler("postNip05", async (req, res) => {
    const {
      name,
      data: { pubkey, relays },
    } = req.body;

    const currentPubkey = await req.redis.get(`pubkey:${name}`);

    if (currentPubkey && currentPubkey !== pubkey) {
      return res
        .status(409)
        .send("Conflict: pubkey already exists, you can only change associated relays.");
    }

    const pipeline = req.redis.multi();
    await pipeline.set(`pubkey:${name}`, pubkey);
    await pipeline.del(`relays:${pubkey}`);
    if (relays?.length) {
      await pipeline.sadd(`relays:${pubkey}`, ...relays);
    }

    const result = await pipeline.exec();
    logger.info(`Added ${name} with pubkey ${pubkey}`);

    res.status(200).send();
  })
);

router.get(
  "/.well-known/nostr.json",
  extractSubdomains,
  validateSchema(getNip05),
  asyncHandler("getNip05", async (req, res) => {
    const name =
      req.query.name === "_" ? req.nonRootSubdomains : req.query.name;

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

export default router;
