import atob from 'atob'; // You might need to install this package
import asyncHandler from './asyncHandler.js';
import { AppError } from '../errors.js';
import config from '../../config/index.js';

const secretToken = config.secretToken;

export default function basicAuth(req, res, next) {
    return (asyncHandler('basicAuth', async (req, res) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(401, 'Authentication required.');
        }

        const encoded = authHeader.split(' ')[1];
        const decoded = atob(encoded);

        const password = decoded.split(':')[0];

        if (password !== secretToken) {
          throw new AppError(403, 'Access denied.');
        }
    }))(req, res, next);
};
