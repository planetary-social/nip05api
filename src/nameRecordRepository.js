import NameRecord from "./nameRecord.js";
import { AppError } from "./errors.js";

const MAX_ENTRIES = 1000;
export default class NameRecordRepository {
  constructor(redisClient) {
    this.redis = redisClient;
  }

  async findByName(name) {
    const luaScript = `
      local pubkey = redis.call('GET', 'pubkey:' .. KEYS[1])
      if not pubkey then return nil end
  
      local relays = redis.call('SMEMBERS', 'relays:' .. pubkey)
      local userAgent = redis.call('GET', 'user_agent:' .. pubkey)
      local clientIp = redis.call('GET', 'ip:' .. pubkey)
      local updatedAt = redis.call('GET', 'updated_at:' .. pubkey)
  
      return {pubkey, relays, userAgent, clientIp, updatedAt}
    `;

    const result = await this.redis.eval(luaScript, 1, name);
    if (!result) return null;

    const [pubkey, relays, userAgent, clientIp, updatedAt] = result;

    return new NameRecord(name, pubkey, relays, clientIp, userAgent, updatedAt);
  }

  async save(nameRecord) {
    const { name, pubkey, relays, clientIp, userAgent } = nameRecord;
    const updated_at = new Date().toISOString();
    const timestamp = new Date(updated_at).getTime() / 1000; // Convert to UNIX timestamp

    const currentPubkey = await this.redis.get(`pubkey:${name}`);
    if (currentPubkey && currentPubkey !== pubkey) {
      throw new AppError(
        409,
        "Conflict: pubkey already exists, you can only change associated relays."
      );
    }

    const pipeline = this.redis.multi();
    pipeline.set(`pubkey:${name}`, pubkey);

    pipeline.del(`relays:${pubkey}`);
    if (relays && relays.length) {
      pipeline.sadd(`relays:${pubkey}`, ...relays);
    }
    if (clientIp) {
      pipeline.set(`ip:${pubkey}`, clientIp);
    }
    if (userAgent) {
      pipeline.set(`user_agent:${pubkey}`, userAgent);
    }
    pipeline.set(`updated_at:${pubkey}`, updated_at);

    pipeline.zadd(`name_record_updates`, timestamp, name);
    // Keep the latest maxEntries records by removing older ones
    pipeline.zremrangebyrank(`name_record_updates`, 0, -(MAX_ENTRIES + 1));

    await pipeline.exec();
  }

  async deleteByName(name) {
    const pubkey = await this.redis.get(`pubkey:${name}`);
    if (!pubkey) return false;

    const pipeline = this.redis.multi();
    pipeline.del(`pubkey:${name}`);
    pipeline.del(`relays:${pubkey}`);
    pipeline.del(`ip:${pubkey}`);
    pipeline.del(`user_agent:${pubkey}`);
    pipeline.del(`updated_at:${pubkey}`);
    pipeline.zrem(`name_record_updates`, name);

    await pipeline.exec();
    return true;
  }

  async findLatest(limit = 10) {
    const names = await this.redis.zrevrange(
      "name_record_updates",
      0,
      limit - 1
    );
    const records = await Promise.all(
      names.map((name) => this.findByName(name))
    );

    return records;
  }

  async setLastSentEntryTimestamp(timestamp) {
    await this.redis.set("lastSentEntryTimestamp", timestamp);
  }

  async getLastSentEntryTimestamp() {
    const timestamp = await this.redis.get("lastSentEntryTimestamp");
    return timestamp ? parseInt(timestamp, 10) : null;
  }
}
