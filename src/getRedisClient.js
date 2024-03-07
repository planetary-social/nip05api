import config from "../config/index.js";
import logger from "./logger.js";

// istanbul ignore next
const redisImportPromise = process.env.NODE_ENV === "test"
  ? import("ioredis-mock")
  : import("ioredis");

let redisClient;

async function initializeRedis() {
  try {
    const Redis = (await redisImportPromise).default;
    redisClient = new Redis({
      host: config.redis.host,
      port: 6379,
      db: config.redis.db,
    });

    redisClient.on("connect", () => logger.info("Connected to Redis"));
    redisClient.on("error", (err) => logger.error(err, "Redis error"));
  } catch (error) {
    // istanbul ignore next
    logger.error(error, "Error initializing Redis client");
  }
}

async function getRedisClient() {
  if (!redisClient) {
    await initializeRedis();
  }
  return redisClient;
}

export default getRedisClient;