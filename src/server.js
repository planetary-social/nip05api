import app from "./app.js";
import logger from "./logger.js";
import config from "../config/index.js";
import { getRemoteRedisClient, getRedisClient } from "./getRedisClient.js";
import VanishSubscriber from "./vanishSubscriber.js"; // Import the VanishSubscriber class

const vanishRequestsRedisClient = await getRemoteRedisClient();
const nip05RedisClient = await getRedisClient();

const server = app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

const vanishSubscriber = new VanishSubscriber(
  vanishRequestsRedisClient,
  nip05RedisClient
);
vanishSubscriber.run();

async function gracefulShutdown() {
  logger.info("Graceful shutdown initiated...");

  vanishSubscriber.stop();

  while (vanishSubscriber.isRunning) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  server.close(() => {
    logger.info("Express server closed.");
    process.exit(0);
  });
}

process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught exception detected");
  gracefulShutdown();
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(reason, "An unhandled promise rejection was detected");
});

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
