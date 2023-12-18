import express, { json } from "express";
import redisClient from "./redisClient.js";
import routes from "./routes.js";
import logger from "./logger.js";
import pinoHTTP from "pino-http";
import promClient from "prom-client";
import promBundle from "express-prom-bundle";

const app = express();

const metricsMiddleware = promBundle({
  includeMethod: true,
  includeStatusCode: true,
  includePath: true,
  includeDefaultMetrics: true,
});

app.use(json());

app.use(
  pinoHTTP({
    logger,
    quietReqLogger: true,
  })
);

app.use((req, res, next) => {
  req.redis = redisClient;
  next();
});

promClient.collectDefaultMetrics();
app.use(metricsMiddleware);
app.use("/", routes);

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 ? "Internal Server Error" : err.message || "Unknown Error";

  logger.error(err);
  res.status(status).json({ error: message });
});

export default app;
