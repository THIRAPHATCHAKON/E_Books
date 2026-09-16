import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Book, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderWithBook = Order & { book: Book | null };

export default async function DownloadPage({
  params,
  searchParams
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ email?: string }>;
}) {
  const { orderNumber } = await params;
  const { email: emailParam } = await searchParams;

  let order: OrderWithBook | null = null;
  let queryFailed = false;

  try {
    const client = getServiceClient();
    const { data } = await client
      .from("orders")
      .select("*, book:books(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    order = (data as unknown as OrderWithBook) ?? null;
  } catch {
    queryFailed = true;
  }

  if (queryFailed) {
    throw new Error("supabase-unavailable");
  }
  if (!order) {
    notFound();
  }

  const isPaid = order.status === "PAID";
  const price = order.book ? Number(order.book.price) : 0;
  const emailStatus =
    emailParam === "sent"
      ? "Sent"
      : emailParam === "failed"
        ? "Failed"
        : null;

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-stone-800">Download</h1>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              This order is still <strong>PENDING</strong>. Download is only
              available after a successful payment.
            </p>
          </div>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Browse E-books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4">
      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <p className="text-4xl">✓</p>
        <h1 className="mt-2 text-xl font-bold text-stone-800">
          Payment Successful
        </h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Thank you for your purchase
        </p>

        <dl className="mt-5 space-y-3 text-sm text-left">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Order</dt>
            <dd className="font-semibold">{order.order_number}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Book</dt>
            <dd className="max-w-[60%] text-right font-medium">
              {order.book?.title ?? "Unknown book"}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Customer</dt>
            <dd className="font-medium">{order.customer_name}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Total</dt>
            <dd className="font-medium">{formatPrice(price)}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Payment Status</dt>
            <dd className="font-semibold text-emerald-700">PAID</dd>
          </div>
          {emailStatus && (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-stone-600">Email Status</dt>
              <dd
                className={`font-semibold ${emailStatus === "Sent" ? "text-emerald-700" : "text-amber-700"}`}
              >
                {emailStatus}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-stone-200 pt-5">
          <p className="mb-3 text-sm text-stone-600">
            Your e-book is ready. The download link is valid for 10 minutes.
          </p>
          <a
            href={`/api/download/${order.order_number}`}
            className="rounded-lg bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Download E-book
          </a>
        </div>

        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="text-xs text-stone-400">
            DEMO ONLY — No real financial transaction occurred.
          </p>
        </div>
      </div>
    </div>
  );
}