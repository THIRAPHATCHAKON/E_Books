"use client";

import { QRCodeSVG } from "qrcode.react";

export default function MockPaymentQR({
  payload
}: {
  payload: string;
}) {
  return (
    <div className="inline-block rounded-xl border border-stone-200 bg-white p-3">
      <QRCodeSVG
        value={payload}
        size={200}
        marginSize={2}
        bgColor="#ffffff"
        fgColor="#1c1917"
        level="M"
        title="DEMO QR Code"
      />
    </div>
  );
}