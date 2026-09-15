import BookCard from "@/components/BookCard";
import { getPublicClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let books: Book[] = [];
  let error: string | null = null;

  try {
    const { data, error: queryError } = await getPublicClient()
      .from("books")
      .select("*")
      .order("created_at", { ascending: true });

    if (queryError) throw queryError;
    books = (data as Book[]) ?? [];
  } catch {
    error =
      "Could not load books from Supabase. Make sure the database schema is applied and .env.local is configured.";
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="py-6 sm:py-10">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          E-books, ready to download in minutes.
        </h1>
        <p className="mt-3 max-w-xl text-stone-600 sm:text-lg">
          Browse the catalog, place a demo order, and experience the full
          checkout flow.
        </p>
      </section>

      <section>
        {error ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
            {error}
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-xl border border-stone-200 bg-white p-10 text-center text-stone-500">
            No books yet. Insert the demo books using{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">
              supabase/seed.sql
            </code>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}