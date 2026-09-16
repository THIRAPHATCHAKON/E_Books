import "server-only";
import { getServiceClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/order";
import { sendOrderEmail } from "@/lib/resend";

type ServiceClient = ReturnType<typeof getServiceClient>;

type FinalizeOrderParams = {
  orderId: string;
  bookId: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
};

export type EmailStatus = "sent" | "failed" | "skipped";

const BUCKET = "ebooks";
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

function filenameFromPath(filePath: string): string {
  const base = filePath.split("/").pop() || "ebook.pdf";
  return base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
}

export async function markOrderAsPaid(
  client: ServiceClient,
  { orderId, bookId, customerName, customerEmail, orderNumber }: FinalizeOrderParams,
  origin: string
): Promise<EmailStatus> {
  const { data: transitioned, error: updateError } = await client
    .from("orders")
    .update({ status: "PAID", paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "PENDING")
    .select("id");

  if (updateError) {
    throw new Error("payment-update-failed");
  }

  const changedRows = transitioned?.length ?? 0;
  if (changedRows === 0) {
    return "skipped";
  }

  let emailStatus: EmailStatus = "sent";
  try {
    const { data: book } = await client
      .from("books")
      .select("title, file_path")
      .eq("id", bookId)
      .maybeSingle();

    if (!book || !book.file_path || !isValidEmail(customerEmail)) {
      throw new Error("email-prep-failed");
    }

    let attachment: { filename: string; content: Buffer } | undefined;
    try {
      const { data: blob, error: downloadError } = await client.storage
        .from(BUCKET)
        .download(book.file_path);

      if (!downloadError && blob) {
        const buffer = Buffer.from(await blob.arrayBuffer());
        if (buffer.byteLength > 0 && buffer.byteLength <= MAX_ATTACHMENT_BYTES) {
          attachment = {
            filename: filenameFromPath(book.file_path),
            content: buffer
          };
        }
      }
    } catch {
      attachment = undefined;
    }

    await sendOrderEmail({
      to: customerEmail,
      customerName,
      orderNumber,
      bookTitle: book.title ?? "your e-book",
      downloadUrl: `${origin}/api/download/${orderNumber}`,
      attachment
    });
  } catch {
    emailStatus = "failed";
  }

  return emailStatus;
}