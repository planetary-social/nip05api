const pubkeyPattern = "^[a-fA-F0-9]{64}$";
// We accept uppercase but we will convert everything to lowercase
const namePattern = "^[a-zA-Z0-9-_]+$";
const maxLength = 30;

export const postNip05 = {
  target: "body",
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        pattern: namePattern,
        maxLength,
        notForbiddenName: true,
      },
      data: {
        type: "object",
        properties: {
          pubkey: { type: "string", pattern: pubkeyPattern },
          relays: {
            type: "array",
            items: { type: "string", format: "uri" },
          },
        },
        required: ["pubkey"],
        additionalProperties: false,
      },
    },
    required: ["name", "data"],
    additionalProperties: false,
  },
};

export const nip05QueryName = {
  target: "query",
  schema: {
    type: "object",
    properties: {
      name: { type: "string", pattern: namePattern, maxLength },
    },
    required: ["name"],
    additionalProperties: false,
  },
};

export const nip05ParamsName = {
  target: "params",
  schema: {
    type: "object",
    properties: {
      name: { type: "string", pattern: namePattern, maxLength },
    },
    required: ["name"],
    additionalProperties: false,
  },
};
