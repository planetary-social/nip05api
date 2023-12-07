export default {
    redis: {
        host: "redis"
    },
    pinoLogLevel: "info",
    secretBasicAuthToken: process.env.SECRET_TOKEN || 'password',
};