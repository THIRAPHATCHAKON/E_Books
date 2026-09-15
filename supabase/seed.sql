-- ============================================================
-- E-book Shop — demo seed data (3 books)
-- Run AFTER schema.sql. Upsert is idempotent.
-- ============================================================

insert into public.books (id, title, description, price, cover_url, file_path)
values
  (
    'aaaaaaaa-0000-4000-8000-000000000001',
    'The Art of Focus',
    'A practical guide to deep work and sustained concentration in a world full of distractions.',
    9.99,
    '/covers/art-of-focus.svg',
    'ebooks/the-art-of-focus.pdf'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000002',
    'Practical TypeScript',
    'Learn modern TypeScript by example, from basic types to advanced patterns used in production apps.',
    14.99,
    '/covers/practical-typescript.svg',
    'ebooks/practical-typescript.pdf'
  ),
  (
    'aaaaaaaa-0000-4000-8000-000000000003',
    'Clean Web Design',
    'Core design principles, typography and layout ideas for building simple, beautiful interfaces.',
    12.99,
    '/covers/clean-web-design.svg',
    'ebooks/clean-web-design.pdf'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  cover_url = excluded.cover_url,
  file_path = excluded.file_path;