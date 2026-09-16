"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ConfirmResponse = {
  ok: boolean;
  emailStatus?: "sent" | "failed";
  alreadyPaid?: boolean;
  message?: string;
};

export default function MockPaymentForm({
  orderNumber
}: {
  orderNumber: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => {
      router.push(`/download/${orderNumber}`);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [success, orderNumber, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Please enter the demo payment code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, demoPaymentCode: code.trim() })
      });
      const data: ConfirmResponse = await res.json();

      if (!res.ok || data.ok !== true) {
        setError(data.message ?? "Could not confirm the payment. Try again.");
        return;
      }

      if (data.alreadyPaid) {
        router.push(`/download/${orderNumber}`);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Could not confirm the payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-4xl">✓</p>
        <h2 className="mt-2 text-xl font-bold text-emerald-800">
          Payment Successful
        </h2>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          DEMO PAYMENT COMPLETED
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-emerald-700">Order</dt>
            <dd className="font-semibold text-emerald-900">{orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-emerald-700">Status</dt>
            <dd className="font-semibold text-emerald-900">PAID</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-emerald-700">
          This message is only a simulation. No real financial transaction
          occurred.
        </p>
        <p className="mt-2 text-xs text-emerald-600">
          Redirecting to your download page…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor="payment-code" className="text-sm font-medium text-stone-700">
          Payment Code
        </label>
        <input
          id="payment-code"
          name="payment-code"
          type="text"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="DEMO-XXXXXX"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-center text-sm font-mono tracking-widest uppercase outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Confirming…" : "Confirm Mock Payment"}
      </button>
    </form>
  );
}