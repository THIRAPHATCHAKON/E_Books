export function formatPrice(price: number): string {
  const value =
    typeof price === "number" && Number.isFinite(price) ? price : Number(price);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}