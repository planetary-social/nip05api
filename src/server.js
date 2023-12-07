import app from "./app.js";
import logger from "./logger.js";

app.listen(3000, () => {
  logger.info("Server is running on port 3000");
});

process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught exception detected');
  server.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.abort();
  }, 1000).unref()
  process.exit(1);
});


process.on('unhandledRejection', (reason, promise) => {
  logger.error(reason, 'An unhandled promise rejection was detected');
});
