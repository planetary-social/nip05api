import { Router } from 'express';
import asyncHandler from './middlewares/asyncHandler.js';
import validateSchema from './middlewares/validateSchema.js';
import logger from './logger.js';
import { nostrSchema } from './schemas.js';
const router = Router();

router.post('/.well-known/nostr.json',
  validateSchema(nostrSchema),
  asyncHandler('postNip05', async (req, res) => {
    const { name, data: {pubkey, relays} } = req.body;
    const pipeline = req.redis.multi();
    await pipeline.set(`pubkey:${name}`, pubkey);

    await pipeline.del(`relays:${pubkey}`);
    if (relays.length > 0) {
        await pipeline.sadd(`relays:${pubkey}`, ...relays);
    }

    const result = await pipeline.exec();
    logger.info(`Redis result: ${JSON.stringify(result, null, 2)}`);

    res.status(200).send();
  })
);

router.get('/.well-known/nostr.json', asyncHandler('getNip05', async (req, res) => {
    const { name } = req.query;
    const pubkey = await req.redis.get(`pubkey:${name}`);
    logger.info(`pubkey: ${pubkey}`);
    const relays = await req.redis.smembers(`relays:${pubkey}`);

    const response = { names: {}, relays: {} };
    response.names[name] = pubkey;
    response.relays[pubkey] = relays;

    res.status(200).json(response);
}));

export default router;