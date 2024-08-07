import pino from "pino";
import config from "../config/index.js";

export default pino({
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  prettyPrint: false, // Ensuring logs are in JSON format, single-line
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
    }),
  },
});
