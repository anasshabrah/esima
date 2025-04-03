// src/app/api/send-login-link/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/utils/email';
import logger from '@/utils/logger.server';
import { supportedLanguages, SupportedLanguage, defaultLanguage } from '@/translations/supportedLanguages';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Find the user along with their orders
    const user = await prisma.user.findUnique({
      where: { email },
      include: { orders: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No order associated with this email.' },
        { status: 404 }
      );
    }

    if (!user.orders || user.orders.length === 0) {
      return NextResponse.json(
        { error: 'No order associated with this email.' },
        { status: 404 }
      );
    }

    // Ensure the user has a token
    let updatedUser = user;
    if (!user.token) {
      updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          token: uuidv4(),
        },
        include: { orders: true }, // Include orders in the updated user
      });
    }

    // Determine the user's language preference
    const userLanguage = supportedLanguages.find(
      (langObj: SupportedLanguage) => langObj.code === user.language
    )
      ? user.language
      : defaultLanguage.code;

    // Construct the login link based on whether it's the default language
    const isDefaultLanguage = userLanguage === defaultLanguage.code;
    const loginLink = isDefaultLanguage
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/customer/${updatedUser.token}`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/${userLanguage}/customer/${updatedUser.token}`;

    // Send the email with the login link
    const emailOptions = {
      to: email,
      subject: 'alodata Login Link',
      html: `
        <p>Hello,</p>
        <p>Click the button below or the link to login to your alodata account:</p>
        <p style="text-align: center;">
          <a href="${loginLink}" style="
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #0070f3;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
          ">
            Login to alodata
          </a>
        </p>
        <p>If the button doesn't work, please use the following link:</p>
        <p><a href="${loginLink}">${loginLink}</a></p>
        <p>If you did not request this email, please ignore it.</p>
        <p>Best regards,<br/>alodata</p>
      `,
    };

    await sendEmail(emailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in send-login-link API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'An error occurred while sending the login link.' },
      { status: 500 }
    );
  }
}
