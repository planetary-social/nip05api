import express, { json } from 'express';
import redisClient from './redisClient.js';
import routes from './routes.js';
import logger from './logger.js';
import pinoHTTP from 'pino-http';
import { AppError } from './errors.js';

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
    if (err instanceof AppError) {
        res.status(err.status).json({ error: err.message });
    } else {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default app;
