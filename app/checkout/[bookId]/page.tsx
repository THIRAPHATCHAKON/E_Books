import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "@/components/CheckoutForm";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;

  let book: Book | null = null;
  let queryFailed = false;

  try {
    const { data } = await getPublicClient()
      .from("books")
      .select("*")
      .eq("id", bookId)
      .maybeSingle();
    book = (data as Book) ?? null;
  } catch {
    queryFailed = true;
  }

  if (queryFailed) {
    throw new Error("supabase-unavailable");
  }
  if (!book) {
    notFound();
  }

  const price = typeof book.price === "number" ? book.price : Number(book.price);

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href={book.id ? `/books/${book.id}` : "/"} className="hover:text-stone-800">
          Back to book
        </Link>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
        <CheckoutForm book={book} />

        <aside className="h-fit rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Order summary
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-stone-600">Book</dt>
              <dd className="text-right font-medium">{book.title}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-stone-600">Price</dt>
              <dd className="font-medium">{formatPrice(price)}</dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-stone-200 pt-2">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{formatPrice(price)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}