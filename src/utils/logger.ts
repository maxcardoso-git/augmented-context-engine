import winston from 'winston';
import { config } from '../config';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(logColors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';

    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;

    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';

    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: config.service.env === 'production' ? logFormat : consoleFormat,
  }),
];

// Em produção, adicionar transporte para arquivo
if (config.service.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: logFormat,
    })
  );
}

export const logger = winston.createLogger({
  level: config.observability.logLevel,
  levels: logLevels,
  transports,
  exitOnError: false,
});

// Helper para adicionar contexto de request
export function createRequestLogger(requestId: string, tenantId?: string) {
  return {
    info: (message: string, meta?: any) =>
      logger.info(message, { requestId, tenantId, ...meta }),
    warn: (message: string, meta?: any) =>
      logger.warn(message, { requestId, tenantId, ...meta }),
    error: (message: string, meta?: any) =>
      logger.error(message, { requestId, tenantId, ...meta }),
    debug: (message: string, meta?: any) =>
      logger.debug(message, { requestId, tenantId, ...meta }),
  };
}
