import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { sendOrderEmail } from "@/lib/resend";
import { isValidEmail } from "@/lib/order";

export async function POST(req: NextRequest) {
  let body: { orderNumber?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const orderNumber = body?.orderNumber?.trim();
  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Order number is required." },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getServiceClient();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Service unavailable." },
      { status: 500 }
    );
  }

  const { data: order, error } = await client
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Could not look up the order." },
      { status: 500 }
    );
  }
  if (!order) {
    return NextResponse.json(
      { ok: false, message: "Order not found." },
      { status: 404 }
    );
  }

  if (order.status === "PAID") {
    return NextResponse.json({
      ok: true,
      alreadyPaid: true,
      emailStatus: "skipped"
    });
  }

  const { error: updateError } = await client
    .from("orders")
    .update({ status: "PAID", paid_at: new Date().toISOString() })
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: "Payment update failed. Please try again." },
      { status: 500 }
    );
  }

  let emailStatus: "sent" | "failed" = "sent";
  try {
    const { data: book } = await client
      .from("books")
      .select("title")
      .eq("id", order.book_id)
      .maybeSingle();

    if (!isValidEmail(order.customer_email)) {
      throw new Error("invalid email");
    }

    const origin = new URL(req.url).origin;
    await sendOrderEmail({
      to: order.customer_email,
      orderNumber: order.order_number,
      bookTitle: book?.title ?? "your e-book",
      downloadUrl: `${origin}/api/download/${order.order_number}`
    });
  } catch {
    emailStatus = "failed";
  }

  return NextResponse.json({ ok: true, emailStatus });
}