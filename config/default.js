export default {
    redis: {
        host: "localhost"
    },
    logLevel: "info",
    rootDomain: process.env.ROOT_DOMAIN || 'nos.social',
    port: 3000,
    nip98TtlSeconds: 60,
    authPubkey: process.env.AUTH_PUBKEY || '6c815df9b3e7f43492c232aba075b5fa5b6a60b731ce6ccfc7c1e8bd2adcceb2',
};