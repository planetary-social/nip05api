import app from "./app.js";
import logger from "./logger.js";

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});

process.on('uncaughtException', (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

