import pino, { transport as _transport, stdTimeFunctions } from 'pino';
import config from 'config';

const transport = _transport({
  targets: [
    {
      target: 'pino-pretty',
    },
  ],
});

export default pino(
  {
    level: config.get('pinoLogLevel') || 'info',
    timestamp: stdTimeFunctions.isoTime,
  },
  transport
);
