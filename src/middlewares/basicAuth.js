import atob from 'atob'; // You might need to install this package
import logger from '../logger.js';
import config from '../../config/index.js';

const secretToken = config.secretBasicAuthToken;

export default function basicAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send('Authentication required.');
    }

    const encoded = authHeader.split(' ')[1];
    const decoded = atob(encoded);

    const password = decoded.split(':')[1];
    logger.info(`password ${password}, secretToken ${secretToken}`);

    if (password === secretToken) {
        return next();
    } else {
        return res.status(403).send('Access denied.');
    }
};
