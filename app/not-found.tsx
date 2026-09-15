import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-stone-600">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-700"
      >
        Back to Home
      </Link>
    </div>
  );
}