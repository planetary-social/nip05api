import Ajv from "ajv";
import addFormats from "ajv-formats";
import asyncHandler from "./asyncHandler.js";
import { AppError } from "../errors.js";
import forbiddenNames from "./forbiddenNames.js";
import logger from "../logger.js";

const ajv = new Ajv();
addFormats(ajv);

export default function validateSchema(schemaInfo) {
  return asyncHandler("validateSchema", async (req, res) => {
    const validate = ajv.compile(schemaInfo.schema);

    let valid;
    try {
      if (!req.nip05Name) {
        throw new Error(
          "No NIP-05 name found in the request. Ensure this middleware is used after the extractNip05Name middleware."
        );
      }
      if (req.method !== "GET") {
        if (req.shouldValidateForbiddenNames === undefined) {
          throw new Error(
            "No shouldValidateForbiddenNames found in the request. Ensure this middleware is used after the nip98Auth middleware sets it"
          );
        }

        if (req.shouldValidateForbiddenNames) {
          const isForbidden = forbiddenNames.some((regex) =>
            regex.test(req.nip05Name.toLowerCase())
          );
          logger.info(
            `Tried to use a forbidden name ${req.nip05Name}, req: ${req}`
          );
          if (isForbidden) {
            throw new AppError(422, `Name '${req.nip05Name}' is forbidden.`);
          }
        }
      }

      valid = validate(req[schemaInfo.target]);
    } catch (error) {
      if (error.status !== 422) {
        throw new AppError(400, error.message);
      }

      throw error;
    }

    if (!valid) {
      const prettyErrors = validate.errors
        .map((error) => [error.instancePath, error.message].join(" "))
        .join(", ");
      throw new AppError(422, prettyErrors);
    }
  });
}
