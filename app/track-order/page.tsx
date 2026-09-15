import TrackOrderForm from "./TrackOrderForm";

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Track your order
      </h1>
      <p className="mt-3 text-stone-600">
        Enter the order number and the email you used at checkout. The order is
        shown only when both values match.
      </p>
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5 sm:p-6">
        <TrackOrderForm />
      </div>
    </div>
  );
}