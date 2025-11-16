import sgMail from "@sendgrid/mail";
import { env } from "../../frameworks/config/env.js";

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) => {
  try {

    const content = [];

    if (text) {
      content.push({ type: "text/plain", value: text });
    }

    if (html) {
      content.push({ type: "text/html", value: html });
    }

    if(content.length === 0){
      throw new Error('Email must have either text or content or html content')
    }

    const msg = {
      to,
      from: {
        email: "no-reply@lilibrary.shop",
        name: "EPlanner"
      },
      subject,
      content,
    } as any;

    const response = await sgMail.send(msg);
    return response;

  } catch (error: any) {
    console.error("SendGrid Email failed:", error.response?.body || error);
    throw error;
  }
};
