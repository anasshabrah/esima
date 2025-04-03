// src/utils/auth.ts

import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId?: number;
  referralUserId?: number;
  [key: string]: any;
}

/**
 * Verifies and decodes a JWT token
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

/**
 * Generates a JWT token
 * @param payload The data to encode in the token
 * @param expiresIn Token expiration time (default: 7 days)
 * @returns The generated JWT token
 */
export function generateAuthToken(payload: TokenPayload, expiresIn: string = '7d'): string | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return null;
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    return null;
  }
}
