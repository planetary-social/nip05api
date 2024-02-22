import app from "./app.js";
import logger from "./logger.js";
import config from "../config/index.js";

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

process.on("uncaughtException", (err) => {
  logger.fatal(err, "Uncaught exception detected");
  server.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 1000).unref();
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(reason, "An unhandled promise rejection was detected");
});
