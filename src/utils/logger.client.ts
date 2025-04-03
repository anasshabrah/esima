// src/utils/logger.client.ts

type LogLevel = 'warn' | 'error';

interface Logger {
  warn: (message: string, details?: any) => void;
  error: (message: string, details?: any) => void;
}

const sanitize = (details: any): any => {
  const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'otp'];

  if (typeof details !== 'object' || details === null) {
    return details;
  }

  const sanitized: any = {};

  for (const key of Object.keys(details)) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '****';
    } else if (typeof details[key] === 'object' && details[key] !== null) {
      sanitized[key] = sanitize(details[key]);
    } else {
      sanitized[key] = details[key];
    }
  }

  return sanitized;
};

const logger: Logger = {
  warn: (message, details) => {
    if (details) {
      console.warn(message, sanitize(details));
    } else {
      console.warn(message);
    }
  },
  error: (message, details) => {
    if (details) {
      console.error(message, sanitize(details));
    } else {
      console.error(message);
    }
  },
};

export default logger;
