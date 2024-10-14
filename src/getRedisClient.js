import config from "../config/index.js";
import logger from "./logger.js";

// istanbul ignore next
const redisImportPromise =
  process.env.NODE_ENV === "test" ? import("ioredis-mock") : import("ioredis");

let redisClient;
let remoteRedisClient;

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

async function initializeRemoteRedis() {
  try {
    const Redis = (await redisImportPromise).default;
    remoteRedisClient = new Redis(config.redis.remote_host);

    remoteRedisClient.on("connect", () =>
      logger.info("Connected to Remote Redis")
    );
    remoteRedisClient.on("error", (err) =>
      logger.error(err, "Remote Redis error")
    );
  } catch (error) {
    // istanbul ignore next
    logger.error(error, "Error initializing Remote Redis client");
  }
}

export async function getRedisClient() {
  if (!redisClient) {
    await initializeRedis();
  }
  return redisClient;
}

export async function getRemoteRedisClient() {
  if (!remoteRedisClient) {
    await initializeRemoteRedis();
  }
  return remoteRedisClient;
}
