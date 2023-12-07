export default function extractSubdomain(req, res, next) {
    const host = req.headers.host;
    const subdomain = host.split('.')[0];

    if (subdomain !== 'www' && subdomain !== 'nos') {
        req.subdomain = subdomain;
    }

    next();
}
