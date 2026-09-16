import "server-only";
import { Resend } from "resend";

type OrderEmailParams = {
  to: string;
  customerName: string;
  orderNumber: string;
  bookTitle: string;
  downloadUrl: string;
  attachment?: { filename: string; content: Buffer; contentType?: string } | null;
};

export async function sendOrderEmail({
  to,
  customerName,
  orderNumber,
  bookTitle,
  downloadUrl,
  attachment
}: OrderEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Email is not configured (RESEND_API_KEY / EMAIL_FROM missing).");
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from,
      to: [to],
      subject: `Your E-book is ready 📚`,
      html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1c1917;">
        <h2 style="margin:0 0 4px;">E-book Shop</h2>
        <p style="margin:0 0 16px;color:#57534e;">Payment Successful ✓</p>
        <p style="margin:0 0 16px;">Hello ${customerName},</p>
        <p style="margin:0 0 16px;">Your demo order has been completed successfully.</p>
        <table style="margin:16px 0;border-collapse:collapse;width:100%;">
          <tr>
            <td style="padding:6px 0;color:#57534e;">Order</td>
            <td style="padding:6px 0;font-weight:600;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#57534e;">Book</td>
            <td style="padding:6px 0;font-weight:600;">${bookTitle}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#57534e;">Status</td>
            <td style="padding:6px 0;font-weight:600;">PAID</td>
          </tr>
        </table>
        ${
          attachment
            ? `<p style="margin:0 0 12px;">Your purchased E-book PDF is attached to this email.</p>`
            : `<p style="margin:0 0 12px;">Your E-book is larger than the attachment limit, so here is a temporary secure download link instead:</p>
               <p style="margin:0 0 18px;">
                 <a href="${downloadUrl}" style="background:#1c1917;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;">
                   Download E-book
                 </a>
               </p>
               <p style="color:#57534e;font-size:14px;">If the button does not work, copy this link into your browser:</p>
               <p style="word-break:break-all;font-size:14px;color:#57534e;">${downloadUrl}</p>`
        }
        <p style="margin:16px 0 0;">You can also download the E-book from the website after completing your order.</p>
        <p style="margin:16px 0 0;color:#78716c;font-size:13px;">DEMO PROJECT — No real financial transaction occurred.</p>
        <p style="margin:8px 0 0;color:#78716c;font-size:13px;">Thank you.</p>
      </div>
    `,
    ...(attachment
      ? {
          attachments: [
            {
              filename: attachment.filename,
              content: attachment.content,
              ...(attachment.contentType ? { contentType: attachment.contentType } : {})
            }
          ]
        }
      : {})
  });

  if (error) {
      throw new Error(`Resend rejected the email: ${error.message}`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Resend email send failed unexpectedly.");
  }
}