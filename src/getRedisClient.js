import config from "../config/index.js";
import logger from "./logger.js";

// istanbul ignore next
const redisImportPromise =
  process.env.NODE_ENV === "test" ? import("ioredis-mock") : import("ioredis");

let redisClient;
let vanishRequestsRedisClient;

async function initializeNip05Redis() {
  try {
    const Redis = (await redisImportPromise).default;
    redisClient = new Redis({
      host: config.redis.host,
      port: 6379,
      db: config.redis.db,
    });

    redisClient.on("connect", () => logger.info("Connected to Nip 05 Redis"));
    redisClient.on("error", (err) => logger.error(err, "Nip 05 Redis error"));
  } catch (error) {
    // istanbul ignore next
    logger.error(error, "Error initializing Nip 05 Redis client");
  }
}

async function initializeVanishRequestsRedis() {
  try {
    const Redis = (await redisImportPromise).default;
    vanishRequestsRedisClient = new Redis(config.redis.remote_host);

    vanishRequestsRedisClient.on("connect", () =>
      logger.info("Connected to vanish requests Redis")
    );
    vanishRequestsRedisClient.on("error", (err) =>
      logger.error(err, "Vanish requests Redis error")
    );
  } catch (error) {
    // istanbul ignore next
    logger.error(error, "Error initializing vanish requests Redis client");
  }
}

export async function getNip05RedisClient() {
  if (!redisClient) {
    await initializeNip05Redis();
  }
  return redisClient;
}

export async function getVanishRequestsRedisClient() {
  if (!vanishRequestsRedisClient) {
    await initializeVanishRequestsRedis();
  }
  return vanishRequestsRedisClient;
}
