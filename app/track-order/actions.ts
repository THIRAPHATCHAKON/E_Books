"use server";

import { redirect } from "next/navigation";
import { isValidEmail, isValidOrderNumber } from "@/lib/order";
import { getServiceClient } from "@/lib/supabase/server";

const GENERIC_ERROR =
  "Order not found. Please check the order number and email and try again.";

export type TrackOrderResult = {
  ok: true;
} | {
  ok: false;
  message: string;
};

export async function trackOrder(
  formData: FormData
): Promise<TrackOrderResult> {
  const orderNumber = String(formData.get("orderNumber") ?? "")
    .trim()
    .toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!isValidOrderNumber(orderNumber) || !isValidEmail(email)) {
    return { ok: false, message: GENERIC_ERROR };
  }

  const client = getServiceClient();

  const { data: order } = await client
    .from("orders")
    .select("order_number, customer_email")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order || order.customer_email.toLowerCase() !== email) {
    return { ok: false, message: GENERIC_ERROR };
  }

  redirect(`/orders/${order.order_number}`);
}