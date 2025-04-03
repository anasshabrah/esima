// src/app/api/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

/**
 * Interface representing the decoded JWT token.
 * Ensure that the token payload includes a `userId` field.
 */
interface DecodedToken {
  userId: number;
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

    // 3. Verify the token using JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables.');
      return NextResponse.json(
        { error: 'Internal server error.' },
        { status: 500 }
      );
    }

    let decodedToken: DecodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch (err) {
      console.error('JWT verification failed:', err);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token.' },
        { status: 401 }
      );
    }

    // 4. Extract userId from the decoded token
    const { userId } = decodedToken;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token payload.' },
        { status: 401 }
      );
    }

    // 5. Define the Prisma query to fetch user with referrer
    const user = await prisma.user.findUnique({
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
    }) as Prisma.UserGetPayload<{
      select: {
        id: true;
        email: true;
        name: true;
        phone: true;
        country: true;
        createdAt: true;
        currencyCode: true;
        currencySymbol: true;
        exchangeRate: true;
        language: true;
        referrerId: true;
        referrer: {
          select: {
            id: true;
            name: true;
            email: true;
            referralLink: true;
          };
        };
      };
    }> | null;

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
