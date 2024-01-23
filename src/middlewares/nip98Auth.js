import { nip98 } from "nostr-tools";
import crypto from "crypto";
import asyncHandler from "./asyncHandler.js";
import { AppError, UNAUTHORIZED_STATUS } from "../errors.js";
import config from "../../config/index.js";

const NIP98_EVENT_KIND = 27235;
export default function nip98Auth(customRule) {
  return asyncHandler("nip98Auth", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(
        UNAUTHORIZED_STATUS,
        "NIP-98 Authentication required. See https://github.com/nostr-protocol/nips/blob/master/98.md"
      );
    }


    if (req.headers['x-forwarded-proto'] === 'https') {
      req.protocol = 'https';
    }

    const fullUrl =
      `${req.protocol}` + "://" + `${req.get("host")}${req.originalUrl}`;
    const event = await nip98.unpackEventFromToken(authHeader);

    try {
      await nip98.validateEvent(event, fullUrl, req.method);

      // istanbul ignore next
      if (customRule) {
        await customRule(event, req);
      } else {
        logger.warn(
          "No custom NIP-98 authentication rule specified. It is recommended to restrict the endpoint through some pubkey based rules."
        );
      }
    } catch (error) {
      throw new AppError(UNAUTHORIZED_STATUS, `NIP-98: ${error.message}.`);
    }
  });
}