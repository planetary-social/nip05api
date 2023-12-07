export default {
    redis: {
        host: "localhost"
    },
    logLevel: "info",
    secretBasicAuthToken: process.env.SECRET_TOKEN || 'password',
    rootDomain: process.env.ROOT_DOMAIN || 'localhost',
};