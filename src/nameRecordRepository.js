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

    relays.push("wss://relay.nos.social");
    const expandedRelays = [...new Set(relays)];

    return new NameRecord(
      name,
      pubkey,
      expandedRelays,
      clientIp,
      userAgent,
      updatedAt
    );
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

    pipeline.zadd(`pending_notifications`, timestamp, name);

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
    pipeline.zrem(`pending_notifications`, name);

    await pipeline.exec();
    return true;
  }

  async deleteByPubkey(pubkey) {
    const namesToDelete = [];

    // Use SCAN, avoid KEYS
    const stream = this.redis.scanStream({
      match: "pubkey:*",
      count: 1000,
    });

    let processingPromises = [];

    return new Promise((resolve, reject) => {
      stream.on("data", (resultKeys) => {
        stream.pause();

        const pipeline = this.redis.pipeline();

        resultKeys.forEach((key) => {
          pipeline.get(key);
        });

        pipeline
          .exec()
          .then((results) => {
            const processing = [];

            for (let i = 0; i < resultKeys.length; i++) {
              const key = resultKeys[i];
              const [err, associatedPubkey] = results[i];

              if (err) {
                console.error(`Error getting value for key ${key}:`, err);
                continue;
              }

              if (associatedPubkey === pubkey) {
                const name = key.split(":")[1];
                namesToDelete.push(name);
              }
            }

            stream.resume();
          })
          .catch((err) => {
            stream.destroy();
            reject(err);
          });
      });

      stream.on("end", async () => {
        try {
          for (const name of namesToDelete) {
            await this.deleteByName(name);
          }
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });

      stream.on("error", (err) => {
        reject(err);
      });
    });
  }

  async fetchAndClearPendingNotifications() {
    const luaScript = `
      local entries = redis.call('ZRANGE', 'pending_notifications', 0, -1)
      redis.call('DEL', 'pending_notifications')
      return entries
    `;

    const names = await this.redis.eval(luaScript, 0);

    const records = (
      await Promise.all(names.map((name) => this.findByName(name)))
    ).filter(Boolean);

    return records;
  }
}
