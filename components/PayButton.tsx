"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PayResponse = {
  ok: boolean;
  emailStatus?: "sent" | "failed";
  alreadyPaid?: boolean;
  message?: string;
};

export default function PayButton({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "info" | "error";
    text: string;
  } | null>(null);

  async function simulatePayment() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber })
      });
      const data: PayResponse = await res.json();

      if (!res.ok || data.ok !== true) {
        setNotice({
          kind: "error",
          text: data.message ?? "Payment simulation failed. Please try again."
        });
        return;
      }

      if (data.alreadyPaid) {
        setNotice({ kind: "info", text: "This order was already paid." });
        router.refresh();
        return;
      }

      if (data.emailStatus === "failed") {
        setNotice({
          kind: "info",
          text: "Payment was updated to PAID, but the e-mail delivery failed. Your download link is still available below."
        });
      } else {
        setNotice({
          kind: "success",
          text: "Payment simulated successfully. Your order is now PAID."
        });
      }
      router.refresh();
    } catch {
      setNotice({
        kind: "error",
        text: "Payment simulation failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={simulatePayment}
        disabled={loading}
        className="rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing…" : "Simulate Successful Payment"}
      </button>
      {notice && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            notice.kind === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : notice.kind === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-stone-200 bg-stone-100 text-stone-700"
          }`}
        >
          {notice.text}
        </p>
      )}
    </div>
  );
}