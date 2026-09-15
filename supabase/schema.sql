-- ============================================================
-- E-book Shop — Supabase schema
-- Run this in the Supabase SQL Editor.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- books ----------
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  cover_url text not null default '',
  file_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  book_id uuid not null references public.books(id) on delete restrict,
  customer_name text not null,
  customer_email text not null check (
    customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  status text not null default 'PENDING'
    check (status in ('PENDING', 'PAID')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_order_number_idx on public.orders (order_number);

-- ---------- Row Level Security ----------
-- Books: anyone (anon) may read the catalog.
-- Orders: NO anon policies. The browser can never select, insert or
-- update orders through the public/anon key. All order writes go through
-- server-only code that uses the service role key.

alter table public.books enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Books are publicly readable" on public.books;
create policy "Books are publicly readable"
  on public.books
  for select
  using (true);

-- Ordering write access: server service role bypasses RLS.
-- No select/insert/update/delete policies are created for public.orders.