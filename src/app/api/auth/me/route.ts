// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { verifyAuthToken } from '@/utils/auth';

/**
 * Interface representing the decoded JWT token.
 */
interface DecodedToken {
  userId?: number;
  referralUserId?: number;
  isReferralUser?: boolean;
  // Add other fields if necessary
}

/**
 * Utility function to mask email addresses.
 * Shows only the first three characters of the local part and masks the rest.
 * Example: "john.doe@example.com" => "joh***@***.***"
 *
 * @param email - The email address to mask.
 * @returns The masked email address.
 */
function maskEmail(email: string | null | undefined): string {
  if (!email) return '***@***.***';
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***@***.***';
  const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : '***';
  return `${maskedLocal}@***.***`;
}

/**
 * Utility function to mask phone numbers.
 * Shows only the first three digits and masks the rest.
 * Example: "1234567890" => "123***"
 *
 * @param phone - The phone number to mask.
 * @returns The masked phone number.
 */
function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '***';
  return phone.length > 3 ? `${phone.slice(0, 3)}***` : '***';
}

export async function GET(request: NextRequest) {
  try {
    // 1. Extract the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid authorization header format.' },
        { status: 401 }
      );
    }

    // 2. Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Token not provided.' },
        { status: 401 }
      );
    }

    // 3. Verify the token using our utility function
    const decodedToken = verifyAuthToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token.' },
        { status: 401 }
      );
    }

    // 4. Extract userId or referralUserId from the decoded token
    const userId = decodedToken.userId;
    const referralUserId = decodedToken.referralUserId;
    const isReferralUser = decodedToken.isReferralUser;

    if (!userId && !referralUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token payload.' },
        { status: 401 }
      );
    }

    let user = null;

    // 5. Fetch the appropriate user based on the token payload
    if (isReferralUser && referralUserId) {
      // Fetch referral user
      user = await prisma.referralUser.findUnique({
        where: { id: referralUserId },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          createdAt: true,
          // Add other fields as needed
        },
      });
    } else if (userId) {
      // Fetch regular user
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          country: true,
          createdAt: true,
          currencyCode: true,
          currencySymbol: true,
          exchangeRate: true,
          language: true,
          referrerId: true,
          isAdmin: true,
          role: true,
          referrer: {
            select: {
              id: true,
              name: true,
              email: true,
              referralLink: true,
            },
          },
          // Exclude sensitive fields like password, token, ip, etc.
        },
      });
    }

    // 6. Handle case where user is not found
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 7. Mask sensitive fields before sending the response
    const maskedEmail = maskEmail(user.email);
    const maskedPhone = maskPhone(user.phone);

    const responseUser = {
      ...user,
      email: maskedEmail,
      phone: maskedPhone,
      // Add more masking or formatting if necessary
    };

    // 8. Return the user data with a 200 status
    return NextResponse.json(responseUser, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
