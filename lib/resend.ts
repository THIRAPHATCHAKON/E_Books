import "server-only";
import { Resend } from "resend";

type OrderEmailParams = {
  to: string;
  orderNumber: string;
  bookTitle: string;
  downloadUrl: string;
};

export async function sendOrderEmail({
  to,
  orderNumber,
  bookTitle,
  downloadUrl
}: OrderEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM missing).");
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Your e-book is ready — Order ${orderNumber}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1c1917;">
        <h2 style="margin-bottom:8px;">Thank you for your purchase!</h2>
        <p>Your payment was successful and your e-book is ready to download.</p>
        <table style="margin:16px 0;border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:6px 0;color:#57534e;">Order number</td>
            <td style="padding:6px 0;font-weight:600;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#57534e;">Book</td>
            <td style="padding:6px 0;font-weight:600;">${bookTitle}</td>
          </tr>
        </table>
        <p>Download your e-book (the link is temporary and valid for 10 minutes):</p>
        <p style="margin:18px 0;">
          <a href="${downloadUrl}" style="background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;">
            Download E-book
          </a>
        </p>
        <p style="color:#57534e;font-size:14px;">If the button does not work, copy this link into your browser:</p>
        <p style="word-break:break-all;font-size:14px;color:#57534e;">${downloadUrl}</p>
      </div>
    `
  });

  if (error) {
    throw new Error("Resend rejected the email.");
  }
}