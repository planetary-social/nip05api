if (process.env.NODE_ENV === "production") {
    if (!process.env.SECRET_TOKEN) {
        throw new Error("SECRET_TOKEN environment variable is not set");
    }

    if (!process.env.ROOT_DOMAIN) {
        throw new Error("ROOT_DOMAIN environment variable is not set");
    }
}

export default {
    redis: {
        host: "redis",
        db: 0
    },
    logLevel: "info",
    secretToken: process.env.SECRET_TOKEN,
    rootDomain: process.env.ROOT_DOMAIN,
};