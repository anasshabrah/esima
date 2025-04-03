// src/app/api/send-order-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/utils/logger.server';
import { sendEmail } from '@/utils/email';
import QRCode from 'qrcode';
import { Attachment } from 'postmark';
import { z } from 'zod';

// Define validation schemas
const esimSchema = z.object({
  iccid: z.string(),
  smdpAddress: z.string(),
  matchingId: z.string(),
  activationCode: z.string(),
});

const bundleDetailsSchema = z.object({
  name: z.string(),
  dataAmount: z.number(),
  duration: z.number(),
  price: z.number(),
});

const successDetailsSchema = z.object({
  email: z.string().email(),
  bundleDetails: bundleDetailsSchema,
  esimDetails: z.array(esimSchema).min(1),
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = successDetailsSchema.parse(body);

    const { email, bundleDetails, esimDetails } = parsedBody;

    // Generate QR code attachments for each eSIM
    const esimsWithContentIds = await Promise.all(
      esimDetails.map(async (esim, index) => {
        try {
          const qrCodeBuffer = await QRCode.toBuffer(esim.activationCode, {
            type: 'png',
          });

          const contentId = `qrcode${index}@esim.alodata.net`; // Unique Content-ID for each QR code

          const attachment: Attachment = {
            Name: `qrcode${index}.png`,
            Content: qrCodeBuffer.toString('base64'),
            ContentType: 'image/png',
            ContentID: contentId, // Do not include 'cid:' prefix here
          };

          return { esim: { ...esim, contentId }, attachment };
        } catch (qrError) {
          logger.error('Failed to generate QR code.', { iccid: esim.iccid });
          throw new Error('Failed to generate QR code.');
        }
      })
    );

    // Separate attachments and eSIM details
    const attachments = esimsWithContentIds.map((item) => item.attachment);
    const esimsWithIds = esimsWithContentIds.map((item) => item.esim);

    const subject = 'Your eSIM Order Confirmation';

    const html = `
      <div style="font-family: Arial, sans-serif; color: #1F3B4D;">
        <h2>${subject}</h2>
        <p>Thank you for ordering an eSIM from alodata!</p>
        <h3>Bundle Details</h3>
        <ul>
          <li><strong>Name:</strong> ${bundleDetails.name}</li>
          <li><strong>Data Amount:</strong> ${bundleDetails.dataAmount} GB</li>
          <li><strong>Duration:</strong> ${bundleDetails.duration} Days</li>
          <li><strong>Price:</strong> $${bundleDetails.price.toFixed(2)}</li>
        </ul>
        <h3>eSIM Activation</h3>
        ${esimsWithIds
          .map((esim, index) => {
            const appleQuickInstallLink = `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${esim.activationCode}`;
            return `
              <div style="margin-bottom: 20px;">
                <p>Scan the QR code below to activate your eSIM (${index + 1}):</p>
                <img src="cid:${esim.contentId}" style="width: 160px; height: 160px;" alt="eSIM QR Code" />
                <p><strong>Activation Code:</strong> ${esim.activationCode}</p>
                <p><strong>SM-DP+ Address:</strong> ${esim.smdpAddress}</p>
                <p><strong>ICCID:</strong> ${esim.iccid}</p>
                <a href="${appleQuickInstallLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007AFF; color: #fff; text-decoration: none; border-radius: 5px;">
                  <strong>Apple Quick Install</strong>
                </a>
                <a href="https://alodata.net/video/android.mp4" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 10px; margin-left: 10px; padding: 10px 20px; background-color: #34A853; color: #fff; text-decoration: none; border-radius: 5px;">
                  <strong>Android Activation Video</strong>
                </a>
              </div>
            `;
          })
          .join('')}
        <h2>If the data bundle is not working, try this small change:</h2>
        <h3>iOS APN Setup Steps:</h3>
        <ol>
            <li>Open <strong>Settings</strong>.</li>
            <li>Go to <strong>Cellular/Mobile Data</strong>.</li>
            <li>Select <strong>eSIM</strong> under <strong>Data Plans</strong>.</li>
            <li>Go to <strong>Cellular/Mobile Data Network</strong>.</li>
            <li>Change the first <strong>APN</strong> to <em>"data.esim"</em>.</li>
            <li>Leave other fields blank.</li>
        </ol>
        <h3>Android APN Setup Steps:</h3>
        <ol>
            <li>Open <strong>Settings</strong>.</li>
            <li>Go to <strong>Network & Internet</strong>.</li>
            <li>Select <strong>Mobile Networks</strong>.</li>
            <li>Go to <strong>Access Point Names</strong>.</li>
            <li>Change the first <strong>APN</strong> to <em>"data.esim"</em>.</li>
            <li>Leave other fields blank.</li>
        </ol>
        <p>Please follow the instructions on your device to complete the activation.</p>
        <p>Best regards,<br/>The Alodata Team</p>
      </div>
    `;

    const textBody = `
Your eSIM Order Confirmation

Thank you for ordering an eSIM from alodata!

Bundle Details:
- Name: ${bundleDetails.name}
- Data Amount: ${bundleDetails.dataAmount} GB
- Duration: ${bundleDetails.duration} Days
- Price: $${bundleDetails.price.toFixed(2)}

eSIM Activation:
${esimDetails
  .map((esim, index) => `
eSIM (${index + 1}):
- Activation Code: ${esim.activationCode}
- SM-DP+ Address: ${esim.smdpAddress}
- ICCID: ${esim.iccid}

Apple Quick Install: https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${esim.activationCode}
Android Activation Video: https://alodata.net/video/android.mp4
`)
  .join('\n')}

If the data bundle is not working, try this small change:

iOS APN Setup Steps:
1. Open Settings.
2. Go to Cellular/Mobile Data.
3. Select eSIM under Data Plans.
4. Go to Cellular/Mobile Data Network.
5. Change the first APN to "data.esim".
6. Leave other fields blank.

Android APN Setup Steps:
1. Open Settings.
2. Go to Network & Internet.
3. Select Mobile Networks.
4. Go to Access Point Names.
5. Change the first APN to "data.esim".
6. Leave other fields blank.

Please follow the instructions on your device to complete the activation.

Best regards,
The Alodata Team
    `;

    // Send the email once without retry logic.
    await sendEmail({
      to: email,
      subject,
      html,
      text: textBody,
      attachments,
    });

    return NextResponse.json({ message: 'Email sent successfully.' }, { status: 200 });
  } catch (error: unknown) {
    logger.error('Error in send-order-email API.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }
}
