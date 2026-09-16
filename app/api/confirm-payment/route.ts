import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { deriveDemoPaymentCode } from "@/lib/order";
import { markOrderAsPaid, type EmailStatus } from "@/lib/payment";

export async function POST(req: NextRequest) {
  let body: { orderNumber?: string; demoPaymentCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const orderNumber = body?.orderNumber?.trim();
  const demoPaymentCode = body?.demoPaymentCode?.trim() ?? "";

  if (!orderNumber) {
    return NextResponse.json(
      { ok: false, message: "Order number is required." },
      { status: 400 }
    );
  }
  if (!demoPaymentCode) {
    return NextResponse.json(
      { ok: false, message: "Please enter the demo payment code." },
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

  const expectedCode = deriveDemoPaymentCode(order.order_number);
  if (demoPaymentCode.toUpperCase() !== expectedCode) {
    return NextResponse.json(
      { ok: false, message: "Invalid demo payment code" },
      { status: 400 }
    );
  }

  let emailStatus: EmailStatus;
  try {
    emailStatus = await markOrderAsPaid(
      client,
      {
        orderId: order.id,
        bookId: order.book_id,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        orderNumber: order.order_number
      },
      new URL(req.url).origin
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "Payment update failed. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, emailStatus });
}