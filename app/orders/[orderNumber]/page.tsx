import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import PayButton from "@/components/PayButton";
import type { Book, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderWithBook = Order & { book: Book | null };

export default async function OrderPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

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

  const price = order.book ? Number(order.book.price) : 0;
  const created = new Date(order.created_at).toLocaleString();
  const paid = order.paid_at ? new Date(order.paid_at).toLocaleString() : null;
  const isPaid = order.status === "PAID";

  const statusStyles = isPaid
    ? "bg-emerald-100 text-emerald-800"
    : "bg-amber-100 text-amber-800";

  return (
    <div className="mx-auto max-w-2xl">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Order {order.order_number}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Order {order.order_number}
      </h1>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles}`}
          >
            {order.status}
          </span>
          {!isPaid && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              DEMO ONLY
            </span>
          )}
        </div>

        <dl className="mt-5 space-y-3 text-sm sm:text-base">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Order number</dt>
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
            <dt className="text-stone-600">Price</dt>
            <dd className="font-medium">{formatPrice(price)}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-stone-600">Created</dt>
            <dd className="text-stone-700">{created}</dd>
          </div>
          {paid && (
            <div className="flex flex-wrap justify-between gap-2">
              <dt className="text-stone-600">Paid</dt>
              <dd className="text-stone-700">{paid}</dd>
            </div>
          )}
        </dl>

        <div className="mt-6 border-t border-stone-200 pt-5">
          {isPaid ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-stone-600">
                Thank you, {order.customer_name}! Your e-book is ready. The
                download link is temporary and valid for 10 minutes.
              </p>
              <a
                href={`/api/download/${order.order_number}`}
                className="rounded-lg bg-emerald-700 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                Download E-book
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                DEMO ONLY — this is a simulated checkout. No real payment is
                collected.
              </div>
              <PayButton orderNumber={order.order_number} />
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-stone-500">
        For order confirmation, a download email is sent to{" "}
        {order.customer_email} after a successful payment.
      </p>
    </div>
  );
}