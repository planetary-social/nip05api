import config from "../../config/index.js";
import asyncHandler from "./asyncHandler.js";
import { AppError } from "../errors.js";
import { validateName } from "../nameRecord.js";

export default function extractValidatedName(req, res, next) {
  return asyncHandler("extractNip05Name", async (req, res) => {
    const nip05Name = extractName(req);
    req.nip05Name = nip05Name;
  })(req, res, next);
}

function extractName(req) {
  const host = req.hostname;
  validateDomain(host);

  const nonRootSubdomains = host.split(`.${config.rootDomain}`).find(Boolean);

  const nameFromQueryOrBody = getNameFromReq(req);

  let name = nameFromQueryOrBody;
  if (nameFromQueryOrBody === "_") {
    name = validateAndReturnSubdomain(nonRootSubdomains);
  }

  return validateName(name);
}

function getNameFromReq(req) {
  if (!req.query.resource) {
    return req.query.name || req.params.name || req.body.name;
  }

  //Mastodon's webfinger implementation uses the resource query parameter
  return getNameForMastodon(req.query.resource);
}

const usernameRegex = /^acct:([^@]+)/;
function getNameForMastodon(resource) {
  const match = resource.match(usernameRegex);
  if (!match) {
    throw new AppError(422, `Could not find the name from '${resource}'`);
  }

  return match[1];
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
