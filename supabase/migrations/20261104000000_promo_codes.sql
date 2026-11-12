-- Promo codes: generated ahead of time from /admin/promo-codes, entered by
-- the buyer at the payment step of /register.
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  -- "percent": discount_value is 1–100 (% off the ticket subtotal).
  -- "fixed": discount_value is a USD amount off the whole order (pricing is
  -- USD-denominated; converted to IDR for Xendit like the tier prices).
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  -- null = unlimited uses.
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  -- null = never expires.
  valid_until timestamptz,
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  constraint promo_codes_percent_range
    check (discount_type <> 'percent' or discount_value <= 100)
);

alter table promo_codes enable row level security;
-- No policies: only the server (service role key) reads/writes this table.

alter table orders add column if not exists promo_code text;
alter table orders add column if not exists discount_amount numeric(12, 2) not null default 0;

-- Called once per paid order. Atomic increment so concurrent payments can't
-- lose a count.
create or replace function redeem_promo_code(p_code text)
returns void
language sql
as $$
  update promo_codes set used_count = used_count + 1 where code = p_code;
$$;
