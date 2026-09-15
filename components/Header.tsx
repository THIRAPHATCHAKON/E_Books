import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight">
          E-book <span className="text-stone-500">Shop</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/" className="font-medium hover:text-stone-600">
            Home
          </Link>
          <Link href="/track-order" className="font-medium hover:text-stone-600">
            Track Order
          </Link>
        </nav>
      </div>
    </header>
  );
}