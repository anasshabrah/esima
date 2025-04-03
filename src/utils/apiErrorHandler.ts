/**
 * Centralized API error handling utility
 * This utility provides consistent error handling for API routes
 */

import { NextResponse } from 'next/server';
import logger from './logger.server';

export interface ApiErrorResponse {
  error: string;
  status: number;
  details?: unknown;
}

/**
 * Handles API errors consistently across the application
 * @param error The error object or message
 * @param defaultMessage Default message to show if error is not an instance of Error
 * @param logLevel Optional log level (defaults to 'error')
 * @returns Standardized error response object
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string = 'An error occurred',
  logLevel: 'error' | 'warn' | 'info' = 'error'
): ApiErrorResponse => {
  // Log the error with appropriate level by wrapping the error in an object
  if (logLevel === 'error') {
    logger.error('API Error:', { error });
  } else if (logLevel === 'warn') {
    logger.warn('API Warning:', { error });
  } else {
    logger.info('API Info:', { error });
  }
  
  // Handle different error types
  if (error instanceof Error) {
    return { 
      error: error.message, 
      status: 500,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
  
  if (typeof error === 'string') {
    return {
      error: error,
      status: 500
    };
  }
  
  return { 
    error: defaultMessage, 
    status: 500 
  };
};

/**
 * Creates a standardized JSON response for API errors
 * @param error The error object or message
 * @param defaultMessage Default message to show if error is not an instance of Error
 * @param status Optional HTTP status code (defaults to 500)
 * @returns NextResponse with appropriate error format
 */
export const createErrorResponse = (
  error: unknown,
  defaultMessage: string = 'An error occurred',
  status?: number
): NextResponse => {
  const errorResponse = handleApiError(error, defaultMessage);
  
  return NextResponse.json(
    { error: errorResponse.error },
    { status: status || errorResponse.status }
  );
};
