import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);

export default function validateSchema(schema) {
    const validate = ajv.compile(schema);
    return (req, res, next) => {
        const valid = validate(req.body);
        if (!valid) {
            return res.status(400).json(validate.errors);
        }
        next();
    };
};