import Redis from 'ioredis';
import config from '../config/index.js';
import logger from './logger.js';

const redisClient = new Redis({
    host: config.redis.host,
    port: 6379,
    db: config.redis.db
});

redisClient.on('connect', () => logger.info('Connected to Redis'));
redisClient.on('error', (err) => logger.error('Redis error', err));

export default redisClient;
