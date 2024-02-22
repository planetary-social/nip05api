import NameRecord from "./nameRecord";
import { AppError } from "./errors";

export default class NameRecordRepository {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async findByName(name) {
    const pubkey = await this.redis.get(`pubkey:${name}`);
    if (!pubkey) return null;
    const relays = await this.redis.smembers(`relays:${pubkey}`);
    return new NameRecord(name, pubkey, relays || []);
  }

  async save(nameRecord) {
    const currentPubkey = await this.redis.get(`pubkey:${nameRecord.name}`);

    if (currentPubkey && currentPubkey !== nameRecord.pubkey) {
      throw new AppError(
        409,
        "Conflict: pubkey already exists, you can only change associated relays."
      );
    }

    const pipeline = this.redis.multi();
    pipeline.set(`pubkey:${nameRecord.name}`, nameRecord.pubkey);

    // We overwrite relays every time we save a new or existing nameRecord
    pipeline.del(`relays:${nameRecord.pubkey}`);
    if (nameRecord.relays && nameRecord.relays.length) {
      pipeline.sadd(`relays:${nameRecord.pubkey}`, ...nameRecord.relays);
    }
    await pipeline.exec();
  }

  async deleteByName(name) {
    const pubkey = await this.redis.get(`pubkey:${name}`);
    if (!pubkey) return false;

    const pipeline = this.redis.multi();
    pipeline.del(`pubkey:${name}`);
    pipeline.del(`relays:${pubkey}`);
    await pipeline.exec();
    return true; // Successful deletion
  }
}
