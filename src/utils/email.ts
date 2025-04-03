// src/utils/email.ts

import { ServerClient, Attachment } from 'postmark';
import logger from './logger.server';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Attachment[];
}

const postmarkApiKey = process.env.POSTMARK_API_KEY;
const postmarkFromEmail = process.env.EMAIL_FROM || 'support@alodata.net';

if (!postmarkApiKey) {
  throw new Error('POSTMARK_API_KEY is not defined in the environment variables.');
}

const client = new ServerClient(postmarkApiKey);

/**
 * Sends a generic email using Postmark.
 *
 * @param options - Email options including recipient, subject, and content.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, html, text = '', attachments = [] } = options;

  try {
    await client.sendEmail({
      From: postmarkFromEmail,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text,
      Attachments: attachments,
      MessageStream: 'outbound',
    });
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Sends a referral welcome email to the new referral user.
 *
 * @param to - Recipient's email address.
 * @param name - Recipient's name.
 * @param referralLink - User's unique referral link.
 * @param couponCode - User's unique coupon code.
 */
export async function sendReferralWelcomeEmail(
  to: string,
  name: string,
  referralLink: string,
  couponCode: string
): Promise<void> {
  const subject =
    process.env.EMAIL_SUBJECT_REFERRAL_WELCOME ||
    "Welcome to Alodata! Here's Your Referral Information";

  const text = `
    Hi ${name},

    Welcome to Alodata! We're excited to have you on board.

    Here are your referral details:
    
    Coupon Code: ${couponCode}
    Your Commission: 20%

    Share the coupon with others and earn rewards.

    If you have any questions, feel free to reach out to our support team.

    Best regards,
    The Alodata Team
  `;

  const html = `
    <p>Hi ${name},</p>

    <p>Welcome to <strong>Alodata</strong>! We're excited to have you on board.</p>

    <p><strong>Here are your referral details:</strong></p>
    <ul>
      <li><strong>Coupon Code:</strong> <code>${couponCode}</code></li>
    </ul>

    <p>Use these to invite others and earn rewards.</p>

    <p>If you have any questions, feel free to reach out to our support team.</p>

    <p>Best regards,<br>The Alodata Team</p>
  `;

  await sendEmail({
    to,
    subject,
    text,
    html,
  });
}
