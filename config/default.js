export default {
    redis: {
        host: "localhost"
    },
    logLevel: "info",
    secretToken: process.env.SECRET_TOKEN || 'password',
    rootDomain: process.env.ROOT_DOMAIN || 'nos.social',
    port: 3000,
};