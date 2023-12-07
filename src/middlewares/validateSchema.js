import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

export default function validateSchema(schemaInfo) {
    const validate = ajv.compile(schemaInfo.schema);
    return (req, res, next) => {
        const valid = validate(req[schemaInfo.target]);
        if (!valid) {
            return res.status(400).json(validate.errors);
        }
        next();
    };
};