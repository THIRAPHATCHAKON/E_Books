import "server-only";
import { getServiceClient } from "@/lib/supabase/server";
import { isValidEmail } from "@/lib/order";
import { sendOrderEmail } from "@/lib/resend";

type ServiceClient = ReturnType<typeof getServiceClient>;

type FinalizeOrderParams = {
  orderId: string;
  bookId: string;
  customerEmail: string;
  orderNumber: string;
};

export async function markOrderAsPaid(
  client: ServiceClient,
  { orderId, bookId, customerEmail, orderNumber }: FinalizeOrderParams,
  origin: string
): Promise<"sent" | "failed"> {
  const { error: updateError } = await client
    .from("orders")
    .update({ status: "PAID", paid_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    throw new Error("payment-update-failed");
  }

  let emailStatus: "sent" | "failed" = "sent";
  try {
    const { data: book } = await client
      .from("books")
      .select("title")
      .eq("id", bookId)
      .maybeSingle();

    if (!isValidEmail(customerEmail)) {
      throw new Error("invalid email");
    }

    await sendOrderEmail({
      to: customerEmail,
      orderNumber,
      bookTitle: book?.title ?? "your e-book",
      downloadUrl: `${origin}/api/download/${orderNumber}`
    });
  } catch {
    emailStatus = "failed";
  }

  return emailStatus;
}