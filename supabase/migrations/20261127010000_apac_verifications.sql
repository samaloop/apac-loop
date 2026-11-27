-- APAC membership checks: one row per "Confirm APAC membership" click.
-- /api/apac/start creates the row (nonce); /api/apac/callback fills in the
-- signed result from apacoaches.org; payment routes read it to allow the
-- member price. Only the server (service role key) touches this table.
create table if not exists apac_verifications (
  id uuid primary key default gen_random_uuid(),
  -- 32 lowercase hex, sent to apacoaches.org and echoed back once.
  nonce text not null unique,
  -- Pricing tier the buyer was on, so the callback returns them to it.
  return_tier text,
  created_at timestamptz not null default now(),
  -- Filled by the callback after a valid signed result.
  verified_at timestamptz,
  status text check (status in ('active', 'inactive')),
  member_id text,
  member_expires text,
  -- Set when a paid order uses this verification.
  consumed_at timestamptz,
  order_id uuid references orders (id)
);

create index if not exists apac_verifications_member_id_idx on apac_verifications (member_id);

alter table apac_verifications enable row level security;
-- No policies: only the server (service role key) reads/writes this table.

-- Which verification an order used, so the Xendit webhook can mark it spent
-- once the invoice is paid.
alter table orders add column if not exists apac_verification_id uuid references apac_verifications (id);
