export function generateOrderNumber(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const random = new Uint32Array(6);
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(random);
  }
  const suffix = Array.from(random, (n) => alphabet[n % alphabet.length]).join("");
  return `ORD-${year}${month}${day}-${suffix.slice(0, 6)}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidOrderNumber(value: string): boolean {
  return /^ORD-\d{8}-[A-Z0-9]{6}$/.test(value);
}

export function deriveDemoPaymentCode(orderNumber: string): string {
  let h = 0;
  for (let i = 0; i < orderNumber.length; i++) {
    h = ((h << 5) - h + orderNumber.charCodeAt(i)) | 0;
  }
  h = (h ^ 0x9e3779b9) | 0;
  let state = h >>> 0;
  let digits = "";
  const A = 1664525;
  const C = 1013904223;
  for (let i = 0; i < 6; i++) {
    state = (state * A + C) >>> 0;
    digits += String(state % 10);
  }
  return `DEMO-${digits}`;
}