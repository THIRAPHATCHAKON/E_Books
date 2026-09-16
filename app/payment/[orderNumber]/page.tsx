import { notFound } from "next/navigation";
import Link from "next/link";
import { getServiceClient } from "@/lib/supabase/server";
import { deriveDemoPaymentCode } from "@/lib/order";
import MockPaymentQR from "@/components/MockPaymentQR";
import MockPaymentForm from "@/components/MockPaymentForm";
import type { Book, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

type OrderWithBook = Order & { book: Book | null };

export default async function PaymentPage({
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

  if (order.status === "PAID") {
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm text-stone-500">
          This order is already paid.
        </p>
        <Link
          href={`/download/${order.order_number}`}
          className="mt-4 inline-block rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
        >
          View Download Page
        </Link>
      </div>
    );
  }

  const price = order.book ? Number(order.book.price) : 0;
  const totalBaht = `฿${price.toFixed(2)}`;
  const demoCode = deriveDemoPaymentCode(order.order_number);
  const qrPayload = JSON.stringify({
    type: "DEMO_EBOOK_PAYMENT",
    orderNumber: order.order_number,
    bookTitle: order.book?.title ?? "E-book",
    amount: price,
    demoPaymentCode: demoCode,
    demo: true
  });

  return (
    <div className="mx-auto max-w-md px-4">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Payment</span>
      </nav>

      <div className="rounded-xl border border-stone-200 bg-white p-6 text-center">
        <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
          DEMO ONLY
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Mock QR Payment
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Order # {order.order_number}
        </p>

        <p className="mt-2 text-lg font-semibold text-stone-800">
          {order.book?.title ?? "E-book"}
        </p>

        <p className="mt-1 text-xl font-bold text-stone-900">{totalBaht}</p>

        <div className="mt-6 flex justify-center">
          <MockPaymentQR payload={qrPayload} />
        </div>

        <p className="mt-4 text-sm text-stone-600">
          Scan this QR Code to view the simulated payment information.
        </p>

        <p className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-500">
          DEMO ONLY — This QR Code contains simulated payment data. No real
          payment will be processed.
        </p>

        <div className="mt-5 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">
            Demo Payment Code:{" "}
            <span className="font-mono font-bold">{demoCode}</span>
          </p>
        </div>

        <div className="mt-5">
          <MockPaymentForm orderNumber={order.order_number} />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-amber-700">
          Status: PENDING
        </p>

        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="text-xs text-stone-400">
            DEMO ONLY — No real payment will be processed.
          </p>
        </div>
      </div>
    </div>
  );
}