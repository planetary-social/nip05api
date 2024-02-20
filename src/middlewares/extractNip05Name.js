import config from "../../config/index.js";
import asyncHandler from "./asyncHandler.js";
import { AppError } from "../errors.js";

export default function extractNip05Name(req, res, next) {
  return asyncHandler("extractNip05Name", async (req, res) => {
    const nip05Name = extractName(req);
    req.nip05Name = nip05Name.toLowerCase();
  })(req, res, next);
}

function extractName(req) {
  const host = req.hostname;
  validateDomain(host);

  const nonRootSubdomains = host.split(`.${config.rootDomain}`).find(Boolean);
  const nameFromQueryOrBody =
    req.query.name || req.params.name || req.body.name;

  let name = nameFromQueryOrBody;
  if (nameFromQueryOrBody === "_") {
    name = validateAndReturnSubdomain(nonRootSubdomains);
  }

  validateName(name);

  return name;
}

function validateName(name) {
  if (name.length < 3) {
    throw new AppError(
      422,
      `Name '${name}' should have more than 3 characters.`
    );
  }

  if (name.startsWith("-")) {
    throw new AppError(422, `Name '${name}' should not start with a hyphen.`);
  }

  if (name.endsWith("-")) {
    throw new AppError(422, `Name '${name}' should not start with a hyphen.`);
  }
}

function validateDomain(host) {
  if (!host.endsWith(config.rootDomain)) {
    throw new AppError(
      422,
      `Host mismatch: '${host}' does not conform to the expected root domain '${config.rootDomain}'.`
    );
  }
}

function validateAndReturnSubdomain(nonRootSubdomains) {
  if (!nonRootSubdomains) {
    throw new AppError(
      422,
      "The _ format requires a corresponding subdomain as the NIP-05 name."
    );
  }
  return nonRootSubdomains;
}
