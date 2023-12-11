import pino, { transport as _transport, stdTimeFunctions } from 'pino';
import config from '../config/index.js';

const transport = _transport({
  targets: [
    {
      target: 'pino-pretty',
      options: {
        colorize: true,
        minimumLevel: config.logLevel,
      }
    },
  ],
});

export default pino({
  level: config.logLevel,
  timestamp: stdTimeFunctions.isoTime,
},
  transport
);
