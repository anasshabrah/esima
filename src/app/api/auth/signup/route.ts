// src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import logger from '@/utils/logger.server';
import { z } from 'zod';
import { countryPhoneCodes } from '@/utils/countryPhoneCodes';
import { sendReferralWelcomeEmail } from '@/utils/email';

// Define the schema for validating the request body
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  country: z.string().length(2, 'Country must be a 2-letter ISO code.'), // Ensure it's a 2-letter ISO code
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn('Invalid input data for signup.', { errors: parsed.error.errors });
      return NextResponse.json(
        { error: 'Invalid input data.', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { name, email, phone: rawPhone, country, password, referralCode } = parsed.data;

    // Process phone number to include country code
    let phone = rawPhone.trim();
    if (!phone.startsWith('+')) {
      const countryCode = countryPhoneCodes[country.toUpperCase()];
      if (!countryCode) {
        logger.warn('Invalid country code provided.', { country });
        return NextResponse.json({ error: 'Invalid country code.' }, { status: 400 });
      }
      phone = `${countryCode}${phone}`;
    }

    // Optional: Further normalize the phone number (e.g., remove spaces, dashes)
    phone = phone.replace(/\s+/g, '').replace(/-/g, '');

    // Check for Existing User
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingReferralUser = await prisma.referralUser.findUnique({ where: { email } });

    if (existingUser || existingReferralUser) {
      return NextResponse.json(
        {
          error: 'Email is already registered. Please log in or use the forgot password option.',
        },
        { status: 409 }
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Define a custom alphabet that includes only uppercase letters and digits
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nanoidCustom = customAlphabet(alphabet, 6); // 6-character code

    // Generate a unique code for both referralLink and couponCode using a do-while loop
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    do {
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate a unique referral code. Please try again.');
      }

      code = nanoidCustom();
      const existingCode = await prisma.referralUser.findFirst({
        where: {
          OR: [
            { referralLink: `https://alodata.com/?referral=${code}` },
            { couponCode: code },
          ],
        },
      });

      if (!existingCode) {
        isUnique = true;
      }

      attempts++;
    } while (!isUnique);

    const referralLink = `https://alodata.com/?referral=${code}`;
    const couponCodeGenerated = code;

    // Create Referral User
    const newReferralUser = await prisma.referralUser.create({
      data: {
        name,
        email,
        phone,
        country: country.toUpperCase(),
        password: hashedPassword,
        referralLink,
        couponCode: couponCodeGenerated,
      },
    });

    // Define the discount percentage for referral coupons
    const referralDiscountPercent = 10; // or any percentage you prefer

    // Create a new Coupon record
    const newCoupon = await prisma.coupon.create({
      data: {
        code: couponCodeGenerated,
        discountPercent: referralDiscountPercent,
        sponsor: newReferralUser.email, // or newReferralUser.id if you prefer
        validFrom: new Date(), // Coupon is valid from now
        // validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Optional: set expiry date
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Handle Referral Code if provided
    if (referralCode) {
      // Validate referralCode format
      if (!/^[A-Z0-9]{6}$/.test(referralCode)) {
        logger.warn('Invalid referral code format during signup.', { referralCode });
        return NextResponse.json(
          { error: 'Invalid referral code format.' },
          { status: 400 }
        );
      }

      const referrer = await prisma.referralUser.findUnique({
        where: { couponCode: referralCode },
      });

      if (referrer) {
        // Optionally, handle referrer-specific logic here
        // For example, increment referrer's referral count, etc.
      } else {
        logger.warn('Invalid referral code provided during signup.', { referralCode });
        return NextResponse.json(
          { error: 'Invalid referral code.' },
          { status: 400 }
        );
      }
    }

    // Send Referral Welcome Email
    try {
      await sendReferralWelcomeEmail(
        newReferralUser.email,
        newReferralUser.name || 'Valued User',
        referralLink,
        couponCodeGenerated
      );
    } catch (emailError: any) {
      // Log the error but don't block the signup process
      logger.error('Failed to send referral welcome email.', { error: emailError.message });
      // Optionally, you can choose to rollback the user creation or notify admins
    }

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Generate JWT Token
    const token = jwt.sign(
      { referralUserId: newReferralUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ user: newReferralUser, token }, { status: 201 });
  } catch (error: any) {
    logger.error('Signup error:', { error: error.message });
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
