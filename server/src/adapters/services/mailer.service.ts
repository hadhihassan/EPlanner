import nodemailer from 'nodemailer';
import { env } from '../../frameworks/config/env.js';

const transporter = nodemailer.createTransport({
  host: env.EMAIL.HOST,
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL.USER,
    pass: env.EMAIL.PASS
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('Gmail SMTP server is ready');
  }
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: { to: string; subject: string; text?: string; html?: string }) => {

  if (!env.EMAIL.USER || !env.EMAIL.PASS) {
    console.error('Gmail credentials missing');
    return;
  }

  try {
    console.log("Attempting to send email via Gmail...");

    const res = await transporter.sendMail({
      from: `"EPlanner" <${env.EMAIL.USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log("Email sent successfully:", res.messageId);
    return res;

  } catch (error) {
    console.error("Gmail sending failed:", error);
    throw error;
  }
};