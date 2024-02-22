import { AppError } from "./errors.js";
export default class NameRecord {
  constructor(
    name,
    pubkey,
    relays = [],
    clientIp = "",
    userAgent = "",
    updated_at
  ) {
    validateName(name);

    this.name = name;
    this.pubkey = pubkey;
    this.relays = relays;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
    this.updated_at = updated_at;
  }
}

export function validateName(name) {
  if (name.length < 3) {
    throw new AppError(
      422,
      `Name '${name}' should have more than 3 characters.`
    );
  }

  if (name.startsWith("-")) {
    throw new AppError(422, `Name '${name}' should not start with a hyphen -.`);
  }

  if (name.endsWith("-")) {
    throw new AppError(422, `Name '${name}' should not start with a hyphen -.`);
  }

  if (name.includes("_")) {
    throw new AppError(
      422,
      `Name '${name}' should not include an underscore _.`
    );
  }
}
