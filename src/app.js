import express, { json } from "express";
import cron from "node-cron";
import pinoHTTP from "pino-http";
import promClient from "prom-client";
import promBundle from "express-prom-bundle";
import cors from "cors";
import getRedisClient from "./getRedisClient.js";
import routes from "./routes.js";
import logger from "./logger.js";
import NameRecordRepository from "./nameRecordRepository.js";
import fetchAndSendLatestEntries from "./slackNotifier.js";
import config from "../config/index.js";

const redisClient = await getRedisClient();
const nameRecordRepository = new NameRecordRepository(redisClient);
const app = express();

const metricsMiddleware = promBundle({
  includeMethod: true,
  includeStatusCode: true,
  includePath: true,
  includeDefaultMetrics: true,
});

app.set("trust proxy", true);

app.use(json());
app.use(cors());

app.use(
  pinoHTTP({
    logger,
    quietReqLogger: true,
  })
);

app.use((req, res, next) => {
  req.nameRecordRepo = nameRecordRepository;
  next();
});

promClient.collectDefaultMetrics();
app.use(metricsMiddleware);
app.use("/", routes);

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = status === 500 ? "Internal Server Error" : err.message;

  logger.error(err);
  res.status(status).json({ error: message });
});

cron.schedule(config.slackCron, async () => {
  logger.info("Checking for new entries to send to Slack...");
  await fetchAndSendLatestEntries(nameRecordRepository);
});

export default app;
