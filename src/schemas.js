export const nostrSchema = {
    type: "object",
    properties: {
        name: { type: "string" },
        data: { 
            type: "object",
            properties: {
                pubkey: { type: "string", pattern: "^[a-fA-F0-9]{64}$" },
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
    additionalProperties: false
};