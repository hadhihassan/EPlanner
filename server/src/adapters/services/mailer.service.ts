import nodemailer from 'nodemailer';
import { env } from '../../frameworks/config/env.js';

const transporter = nodemailer.createTransport({
  host: env.EMAIL.HOST,
  auth: { user: env.EMAIL.USER, pass: env.EMAIL.PASS }
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: { to: string; subject: string; text?: string; html?: string }) => {
  if (!env.EMAIL.HOST) {
    console.log(`[DEV] Email -> ${to}: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL.USER,
    to,
    subject,
    text,
    html
  });
};
