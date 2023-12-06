import Redis from 'ioredis';
import config from 'config';

const redisClient = new Redis({
    host: config.get('redis').host,
    port: 6379,
    db: config.get('redis').db
});

redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('error', (err) => console.error('Redis error', err));

export default redisClient;
