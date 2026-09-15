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