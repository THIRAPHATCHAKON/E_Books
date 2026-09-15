"use server";

import { generateOrderNumber, isValidEmail } from "@/lib/order";
import { getServiceClient } from "@/lib/supabase/server";

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; message: string };

export async function createOrder(
  bookId: string,
  customerName: string,
  customerEmail: string
): Promise<CreateOrderResult> {
  const name = customerName.trim();
  const email = customerEmail.trim().toLowerCase();

  if (!name) {
    return { ok: false, message: "Please enter your name." };
  }
  if (!isValidEmail(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (!bookId) {
    return { ok: false, message: "Missing book reference." };
  }

  const client = getServiceClient();

  const { data: book } = await client
    .from("books")
    .select("id")
    .eq("id", bookId)
    .maybeSingle();

  if (!book) {
    return { ok: false, message: "This book is no longer available." };
  }

  const orderNumber = generateOrderNumber();

  const { error } = await client.from("orders").insert({
    order_number: orderNumber,
    book_id: bookId,
    customer_name: name,
    customer_email: email,
    status: "PENDING"
  });

  if (error) {
    return {
      ok: false,
      message: "Could not create the order. Please try again in a moment."
    };
  }

  return { ok: true, orderNumber };
}