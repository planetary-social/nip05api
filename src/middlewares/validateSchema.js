import Ajv from "ajv";
import addFormats from "ajv-formats";
import asyncHandler from './asyncHandler.js';
import { AppError } from '../errors.js';
import forbiddenNames from './forbiddenNames.js';

const ajv = new Ajv();
addFormats(ajv);

function validateForbiddenName(schema, data) {
    return !forbiddenNames.some((regex) => regex.test(data));
}

ajv.addKeyword({
  keyword: 'notForbiddenName',
  validate: validateForbiddenName,
  errors: false,
});

export default function validateSchema(schemaInfo) {
    return asyncHandler('validateSchema', async (req, res) => {
        const validate = ajv.compile(schemaInfo.schema);

        let valid;
        try {
            valid = validate(req[schemaInfo.target]);
        } catch (error) {
            throw new AppError(400, error.message)
        }

        if (!valid) {
            const prettyErrors = validate.errors.map((error) => 
              [error.instancePath, error.message].join(' ')
            ).join(', ');
            throw new AppError(422, prettyErrors);
        }
    });
};