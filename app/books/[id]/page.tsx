import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let book: Book | null = null;
  let queryFailed = false;

  try {
    const { data } = await getPublicClient()
      .from("books")
      .select("*")
      .eq("id", id)
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
    <div className="mx-auto max-w-4xl">
      <nav className="mb-6 text-sm text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>{book.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <div className="aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-xl bg-stone-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.cover_url ?? "/covers/placeholder.svg"}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {book.title}
          </h1>
          <p className="leading-relaxed text-stone-600">{book.description}</p>
          <div className="mt-2 text-2xl font-bold">{formatPrice(price)}</div>
          <div className="mt-2">
            <Link
              href={`/checkout/${book.id}`}
              className="inline-block w-full rounded-lg bg-stone-900 px-6 py-3 text-center text-white transition hover:bg-stone-700 sm:w-auto"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}