# E-book Shop

A simple university demo project: a customer-facing e-book shop built with
Next.js, TypeScript, Tailwind CSS, Supabase, and Resend. **Demo only** — no
real payments are processed.

## Features

- Home page with a book catalog (loaded from Supabase)
- Book detail pages at `/books/[id]`
- Checkout at `/checkout/[bookId]` (creates an order with status `PENDING`)
- Order status at `/orders/[orderNumber]` with a **DEMO ONLY** simulated payment
  flow that updates `PENDING → PAID` on the server
- Confirmation e-mail (via Resend) after the order becomes `PAID`
- Temporary signed download link (private Supabase Storage, 10 min expiry)
- Order tracking at `/track-order` that requires order number + e-mail to match
- Responsive mobile layout (works in the MIT App Inventor WebViewer)

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Storage)
- Resend (`@resend/node` package)
- Deploy target: Vercel

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local`:

| Variable                          | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Your Supabase project URL (public)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anon key (public, safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY`       | Service role key (server only — never expose)|
| `RESEND_API_KEY`                  | Resend API key (server only)                 |
| `EMAIL_FROM`                      | Verified sender, e.g. `Shop <onboarding@resend.dev>` |

### 2. Database

1. Create a project on [supabase.com](https://supabase.com).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
3. Run [`supabase/seed.sql`](supabase/seed.sql) to insert the 3 demo books.

### 3. Storage (for downloads)

1. Create a **private** bucket named `ebooks` (Storage → New bucket → uncheck
   "public bucket").
2. Upload your PDF files using paths matching the `file_path` column.
   Example: `ebooks/the-art-of-focus.pdf`.

### 4. Email (optional for the demo)

1. Add the sender address in Resend Domains (e.g. `onboarding@resend.dev`).
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.

### 5. Run

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (this must succeed)
npm run typecheck
```

## Security notes

- The service role key and Resend key are only used in server-side code
  (`lib/supabase/server.ts`, route handlers, server actions) via the
  `server-only` package. They are never sent to the browser.
- Browser Supabase access uses only the anon key.
- RLS is enabled. `books` is publicly readable; `orders` has **no** anon
  policies, so the browser cannot list or change any order.
- `PENDING → PAID` happens only on the server (`POST /api/mark-paid`).
- Download links are signed, temporary (10 minutes), only for `PAID` orders,
  and generated server-side at click time.
- Order tracking requires the order number **and** the e-mail used at checkout;
  mismatches return a generic error and no order data is exposed.

## Error handling

Books/orders not found → custom 404. Supabase/email/signed-URL failures return
generic messages — no stack traces or internal details are shown. If the
confirmation e-mail fails after payment, the `PAID` status is kept and a clear
message is shown instead.

## Deploy to Vercel

1. Push this project to GitHub and import it on Vercel.
2. Add the same environment variables from `.env.example` in the project
   settings on Vercel.
3. Framework preset: Next.js (auto-detected). Default build command works.
4. For MIT App Inventor, point the WebViewer's HomeUrl at the Vercel
   production URL. No native/JS bridges are required.

## Demo flow

1. Home → pick a book → View Details → Buy Now.
2. Fill in name + e-mail → Create Order → redirected to `/orders/ORD-...`.
3. Status shows `PENDING` and a **DEMO ONLY** panel.
4. Click **Simulate Successful Payment** → status becomes `PAID`, `paid_at` is
   set, a confirmation e-mail is sent, and a temporary Download button appears.
5. Use **Track Order** to find any order by order number + e-mail.