const pubkeyPattern = "^[a-fA-F0-9]{64}$";
const namePattern = "^[a-z0-9\-_.]+$";

export const postNip05 = {
    target: "body",
    schema: {
        type: "object",
        properties: {
            name: { type: "string", pattern: namePattern },
            data: {
                type: "object",
                properties: {
                    pubkey: { type: "string", pattern: pubkeyPattern },
                    relays: {
                        type: "array",
                        items: { type: "string", format: "uri" }
                    }
                },
                required: ["pubkey"],
                additionalProperties: false
            }
        },
        required: ["name", "data"],
        additionalProperties: false,
    }
};

export const nip05QueryName = {
    target: "query",
    schema: {
        type: "object",
        properties: {
            name: { type: "string", pattern: namePattern },
        },
        required: ["name"],
        additionalProperties: false,
    }
};