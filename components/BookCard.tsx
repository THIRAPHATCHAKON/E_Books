import Link from "next/link";
import type { Book } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.cover_url ?? "/covers/placeholder.svg"}
          alt={book.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-semibold">{book.title}</h3>
        <p className="line-clamp-2 text-sm text-stone-600">
          {book.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-semibold">
            {formatPrice(typeof book.price === "number" ? book.price : Number(book.price))}
          </span>
          <span className="rounded-lg bg-stone-900 px-3 py-2 text-sm text-white transition group-hover:bg-stone-700">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}