import express, { json } from 'express';
import config from '../config/index.js';
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
        useLevel: config.logLevel,
        quietReqLogger: true,
    })
);

app.use((req, res, next) => {
    req.redis = redisClient;
    next();
});

app.use('/', routes);

app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = status === 500 ? 'Internal Server Error' : err.message || 'Unknown Error';

    logger.warn(err);
    res.status(status).json({ error: message });
});

export default app;
