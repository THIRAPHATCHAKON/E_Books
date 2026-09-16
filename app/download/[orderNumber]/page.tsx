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

  if (!isPaid) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
            ⏳
          </div>
          <h1 className="mt-4 text-xl font-bold text-stone-800">Download</h1>
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              This order is still <strong>PENDING</strong>. Download is only
              available after a successful payment.
            </p>
          </div>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="bg-emerald-600 px-6 py-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl text-white">
            ✓
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Payment Successful
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-wide text-emerald-100">
            Your E-book is Ready!
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
              PAID
            </span>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-3">
              <dt className="text-stone-600">Book</dt>
              <dd className="max-w-[55%] text-right font-semibold text-stone-900">
                {order.book?.title ?? "Unknown book"}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-3">
              <dt className="text-stone-600">Order</dt>
              <dd className="font-semibold text-stone-900">
                {order.order_number}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-3">
              <dt className="text-stone-600">Customer</dt>
              <dd className="max-w-[55%] text-right font-medium text-stone-800">
                {order.customer_name}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-3">
              <dt className="text-stone-600">Total</dt>
              <dd className="font-semibold text-stone-900">
                {formatPrice(price)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-3">
              <dt className="text-stone-600">Status</dt>
              <dd className="font-semibold text-emerald-700">PAID</dd>
            </div>
          </dl>

          {emailParam === "sent" ? (
            <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm">
              <p className="text-emerald-800">Your E-book has been sent to:</p>
              <p className="mt-1 break-all font-semibold text-emerald-900">
                {order.customer_email}
              </p>
            </div>
          ) : emailParam === "failed" ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
              <p className="text-amber-800">
                We couldn't send the E-book to:
              </p>
              <p className="mt-1 break-all font-semibold text-amber-900">
                {order.customer_email}
              </p>
              <p className="mt-2 text-amber-800">
                You can still download your E-book below.
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3">
            <a
              href={`/api/download/${order.order_number}`}
              className="rounded-lg bg-emerald-700 px-6 py-3.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Download E-book
            </a>
            <Link
              href="/"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Back to Store
            </Link>
          </div>

          <p className="mt-5 text-center text-xs text-stone-400">
            DEMO ONLY — No real financial transaction occurred.
          </p>
        </div>
      </div>
    </div>
  );
}