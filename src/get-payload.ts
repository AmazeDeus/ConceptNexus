/* 
CMS initialization
*/

import dotenv from 'dotenv';
import path from 'path';
import type { InitOptions } from 'payload/config';
import payload, { Payload } from 'payload';
import nodemailer from 'nodemailer';

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

// For sending emails (eg. verification email)
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  secure: true,
  port: 465,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY,
  },
});

// cached version of the CMS
let cached = (global as any).payload;

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

interface Args {
  initOptions?: Partial<InitOptions>;
}

export const getPayloadClient = async ({
  initOptions,
}: Args = {}): Promise<Payload> => {
  if (!process.env.PAYLOAD_SECRET) {
    // For signing auth tokens (eg. JWT)
    throw new Error('PAYLOAD_SECRET is not set');
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      email: {
        transport: transporter,
        // fromAddress would be your own domain or custom email when deploying
        // Emails seems to only arrive for the same email that was registered on Resend, likely some spam measure
        fromAddress: process.env.RESEND_EMAIL ?? 'onboarding@resend.dev',
        fromName: 'Concept Nexus',
      },
      secret: process.env.PAYLOAD_SECRET,
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (e: unknown) {
    cached.promise = null;
    throw e;
  }

  return cached.client;
};
