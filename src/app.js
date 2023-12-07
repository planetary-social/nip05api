import express, { json } from 'express';
import redisClient from './redisClient.js';
import routes from './routes.js';
import logger from './logger.js';
import pinoHTTP from 'pino-http';


const app = express();

app.use(json());

app.use(
    pinoHTTP({
      logger,
      useLevel: 'debug',
    })
  );

app.use((req, res, next) => {
    req.redis = redisClient;
    next();
});

app.use('/', routes);

app.use((err, req, res, next) => {
  logger.error(err); // Log the error for debugging

  res.status(err.status || 500);
  res.json({
      error: {
          message: err.message || 'Internal Server Error'
      }
  });
});

export default app;
