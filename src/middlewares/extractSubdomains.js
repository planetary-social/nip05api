import config from '../../config/index.js';
import asyncHandler from './asyncHandler.js';
import { AppError } from '../errors.js';

export default function extractSubdomains(req, res, next) {
    return (asyncHandler('extractSubdomains', async (req, res) => {
        const host = req.hostname;

        if (!host.endsWith(config.rootDomain)) {
            throw new AppError(400, `Host mismatch: '${host}' does not conform to the expected root domain '${config.rootDomain}'. Check and set the server ROOT_DOMAIN environment variable or the Host request header appropriately.`);
        }

        req.nonRootSubdomains = host.split(`.${config.rootDomain}`).find(Boolean);
    }))(req, res, next);
}
