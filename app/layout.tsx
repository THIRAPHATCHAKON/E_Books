import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "E-book Shop",
    template: "%s | E-book Shop"
  },
  description: "A simple e-book shop demo built with Next.js and Supabase."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-900 antialiased">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 sm:text-sm">
          E-book Shop — demo project. No real payments are processed.
        </footer>
      </body>
    </html>
  );
}