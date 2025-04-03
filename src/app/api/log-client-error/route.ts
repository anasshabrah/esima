// src/app/api/log-client-error/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';

type LogLevel = 'warn' | 'error';

export async function POST(req: NextRequest) {
  try {
    const { level, message, details } = await req.json();

    const allowedLevels: LogLevel[] = ['warn', 'error'];

    if (!level || !message || !allowedLevels.includes(level as LogLevel)) {
      logger.warn('Invalid log data received.', { level, message });
      return NextResponse.json({ error: 'Invalid log data.' }, { status: 400 });
    }

    const sanitizeDetails = (details: any): any => {
      const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'otp'];
      if (typeof details !== 'object' || details === null) {
        return details;
      }
      return Object.keys(details).reduce((acc, key) => {
        if (sensitiveKeys.includes(key.toLowerCase())) {
          acc[key] = '****';
        } else if (typeof details[key] === 'object' && details[key] !== null) {
          acc[key] = sanitizeDetails(details[key]);
        } else {
          acc[key] = details[key];
        }
        return acc;
      }, {} as Record<string, unknown>);
    };

    const sanitizedDetails = sanitizeDetails(details);

    const logLevel = level as LogLevel;

    logger[logLevel](message, sanitizedDetails);

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    logger.error('Failed to process client-side log.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Failed to process log.' },
      { status: 500 }
    );
  }
}
