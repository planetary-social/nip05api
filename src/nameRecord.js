import { AppError } from "./errors.js";
import uts46 from "@oozcitak/uts46";
export default class NameRecord {
  constructor(
    name,
    pubkey,
    relays = [],
    clientIp = "",
    userAgent = "",
    updatedAt
  ) {
    validateName(name);

    this.name = name;
    this.pubkey = pubkey;
    this.relays = relays;
    this.clientIp = clientIp;
    this.userAgent = userAgent;
    this.updatedAt = updatedAt;
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

  const validatedName = uts46.toASCII(name);
  if (!validatedName) {
    throw new AppError(422, `Name '${name}' should be a valid UTS46 string.`);
  }

  return validatedName.toLowerCase();
}
