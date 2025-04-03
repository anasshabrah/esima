// src/utils/logger.server.ts

import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { LogLevel, ALLOWED_LOG_LEVELS } from '@/types/types';

const logDir = path.resolve(process.cwd(), 'log');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const loggerLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
};

const logger = createLogger({
  levels: loggerLevels.levels,
  level: process.env.LOG_LEVEL || 'info', // Set default level to 'info'
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'server.log') }),
    new transports.Console(),
  ],
});

export default {
  log: (level: LogLevel, message: string, details?: Record<string, unknown>) => {
    if (!ALLOWED_LOG_LEVELS.includes(level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    logger.log(level, message, details);
  },
  info: (message: string, details?: Record<string, unknown>) => { // Added 'info' method
    if (ALLOWED_LOG_LEVELS.includes('info')) {
      logger.info(message, details);
    }
  },
  warn: (message: string, details?: Record<string, unknown>) => {
    logger.warn(message, details);
  },
  error: (message: string, details?: Record<string, unknown>) => {
    logger.error(message, details);
  },
  debug: (message: string, details?: Record<string, unknown>) => { // Optional 'debug' method
    if (ALLOWED_LOG_LEVELS.includes('debug')) {
      logger.debug(message, details);
    }
  },
};
