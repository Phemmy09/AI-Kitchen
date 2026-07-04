-- =========================================================================
-- RatedWorktops — Core Schema (Supabase / Postgres)
-- Run in Supabase SQL Editor, top to bottom, on a fresh project.
-- =========================================================================

create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- PROFILES — one row per auth.users row. role drives admin access; every
-- policy below checks this instead of trusting anything from the client.
-- -------------------------------------------------------------------------
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text not null default 'New User',
  email             text not null,
  phone             text,
  phone_verified    boolean not null default false,
  role              text not null default 'customer' check (role in ('customer', 'admin', 'super_admin')),
  plan              text not null default 'free' check (plan in ('free', 'monthly', 'annual')),
  credits           integer not null default 10,
  status            text not null default 'active' check (status in ('active', 'suspended')),
  stripe_customer_id text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_profiles_role on profiles(role);
create index if not exists idx_profiles_status on profiles(status);

-- Auto-create a profile row whenever someone signs up (email, Google, phone).
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, credits)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    (select coalesce((select free_credit_amount from platform_settings limit 1), 10))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- -------------------------------------------------------------------------
-- PLATFORM SETTINGS — single row the admin portal edits. Drives free
-- credits, subscription toggle, pricing, storage/project limits.
-- -------------------------------------------------------------------------
create table if not exists platform_settings (
  id                        integer primary key default 1 check (id = 1),
  free_credits_enabled      boolean not null default true,
  subscriptions_enabled     boolean not null default true,
  free_credit_amount        integer not null default 10,
  monthly_price_cents       integer not null default 999,   -- $9.99
  monthly_credits           integer not null default 100,
  annual_price_cents        integer not null default 8999,  -- $89.99
  annual_credits            integer not null default 1500,
  currency                  text not null default 'gbp',
  temp_storage_hours        integer not null default 48,
  max_saved_projects        integer not null default 2,
  max_upload_mb             integer not null default 10,
  updated_at                timestamptz not null default now()
);

insert into platform_settings (id) values (1) on conflict (id) do nothing;

-- -------------------------------------------------------------------------
-- STONE CATALOG — categories -> brands -> colours
-- -------------------------------------------------------------------------
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  icon        text,
  enabled     boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Default categories from the client's PRD (marble/granite/quartz/etc.) so
-- a fresh install isn't an empty list - admins can rename/reorder/disable
-- freely afterwards.
insert into categories (name, icon, sort_order) values
  ('Marble', 'gem', 0),
  ('Granite', 'mountain', 1),
  ('Quartz', 'diamond', 2),
  ('Quartzite', 'hexagon', 3),
  ('Porcelain', 'square', 4),
  ('Sintered Stone', 'layers', 5),
  ('Limestone', 'circle', 6),
  ('Onyx', 'droplet', 7),
  ('Travertine', 'waves', 8)
on conflict (name) do nothing;

create table if not exists brands (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references categories(id) on delete set null,
  name         text not null,
  logo_url     text,
  description  text,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_brands_category on brands(category_id);

create table if not exists stone_colours (
  id           uuid primary key default gen_random_uuid(),
  brand_id     uuid not null references brands(id) on delete cascade,
  name         text not null,
  sku          text,
  texture_url  text not null,
  finish       text,             -- e.g. polished, honed
  price_note   text,
  enabled      boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists idx_colours_brand on stone_colours(brand_id);

-- -------------------------------------------------------------------------
-- RENDERS — every generation lands here first (temporary). Saving a render
-- as a "project" just flips is_saved and clears expires_at, subject to the
-- max_saved_projects limit enforced in application code + a DB check.
-- -------------------------------------------------------------------------
create table if not exists renders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references profiles(id) on delete cascade,
  name              text,
  source_image_url  text not null,
  result_image_url  text,
  watermarked_image_url text,
  stone_colour_id   uuid references stone_colours(id) on delete set null,
  surfaces          jsonb not null default '{}'::jsonb,  -- which surfaces were replaced
  credits_used      integer not null default 1,
  is_saved          boolean not null default false,
  expiry_warned_at  timestamptz,
  expires_at        timestamptz not null default (now() + interval '48 hours'),
  created_at        timestamptz not null default now()
);

create index if not exists idx_renders_user on renders(user_id);
create index if not exists idx_renders_expiry on renders(expires_at) where is_saved = false;

-- -------------------------------------------------------------------------
-- CREDIT TRANSACTIONS — audit trail for every credit add/spend.
-- -------------------------------------------------------------------------
create table if not exists credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  delta       integer not null,               -- positive = granted, negative = spent
  reason      text not null,                  -- 'signup_bonus', 'generation', 'subscription_renewal', 'admin_reset', etc.
  render_id   uuid references renders(id) on delete set null,
  created_by  uuid references profiles(id),   -- admin who triggered it, if manual
  created_at  timestamptz not null default now()
);

create index if not exists idx_credit_tx_user on credit_transactions(user_id);

-- -------------------------------------------------------------------------
-- SHARES — for the "Share Channels" analytics breakdown.
-- -------------------------------------------------------------------------
create table if not exists shares (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  render_id   uuid references renders(id) on delete cascade,
  channel     text not null check (channel in ('whatsapp', 'facebook', 'linkedin', 'x', 'copy_link', 'email')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_shares_render on shares(render_id);

-- -------------------------------------------------------------------------
-- DOWNLOAD EVENTS — for the Dashboard/Analytics "Downloads" metrics.
-- -------------------------------------------------------------------------
create table if not exists download_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  render_id   uuid references renders(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_downloads_render on download_events(render_id);
create index if not exists idx_downloads_created on download_events(created_at desc);

-- -------------------------------------------------------------------------
-- SUBSCRIPTIONS — mirrors Stripe subscription state via webhook.
-- -------------------------------------------------------------------------
create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references profiles(id) on delete cascade,
  stripe_subscription_id  text unique,
  plan                    text not null check (plan in ('monthly', 'annual')),
  status                  text not null check (status in ('active', 'past_due', 'canceled', 'incomplete')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists idx_subscriptions_user on subscriptions(user_id);

-- -------------------------------------------------------------------------
-- ADMIN AUDIT LOG — every admin action, who did it, what changed.
-- -------------------------------------------------------------------------
create table if not exists admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references profiles(id),
  action       text not null,       -- 'suspend_user', 'reset_credits', 'update_pricing', etc.
  target_type  text,                -- 'user', 'brand', 'colour', 'category', 'settings'
  target_id    text,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists idx_audit_admin on admin_audit_log(admin_id);
create index if not exists idx_audit_created on admin_audit_log(created_at desc);

-- =========================================================================
-- ROW LEVEL SECURITY
-- Every table is locked down by default; policies below are the only way in.
-- Admin checks always re-read profiles.role from the DB - never trust a
-- client-supplied role/flag.
-- =========================================================================

alter table profiles enable row level security;
alter table platform_settings enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table stone_colours enable row level security;
alter table renders enable row level security;
alter table credit_transactions enable row level security;
alter table shares enable row level security;
alter table download_events enable row level security;
alter table subscriptions enable row level security;
alter table admin_audit_log enable row level security;

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$ language sql security definer stable;

-- Profiles: users read/update their own row; admins read/update all.
create policy "profiles_select_own_or_admin" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_update_all" on profiles
  for update using (is_admin());

-- Platform settings: public read (drives pricing display), admin-only write.
create policy "settings_public_read" on platform_settings for select using (true);
create policy "settings_admin_write" on platform_settings for update using (is_admin());

-- Stone catalog: public read of enabled rows, admin manages everything.
create policy "categories_public_read" on categories for select using (enabled or is_admin());
create policy "categories_admin_write" on categories for all using (is_admin()) with check (is_admin());

create policy "brands_public_read" on brands for select using (enabled or is_admin());
create policy "brands_admin_write" on brands for all using (is_admin()) with check (is_admin());

create policy "colours_public_read" on stone_colours for select using (enabled or is_admin());
create policy "colours_admin_write" on stone_colours for all using (is_admin()) with check (is_admin());

-- Renders: strictly owner + admin.
create policy "renders_owner_select" on renders for select using (auth.uid() = user_id or is_admin());
create policy "renders_owner_insert" on renders for insert with check (auth.uid() = user_id);
create policy "renders_owner_update" on renders for update using (auth.uid() = user_id or is_admin());
create policy "renders_owner_delete" on renders for delete using (auth.uid() = user_id or is_admin());

-- Credit transactions: read-only for owner, admin can see all, only server (service role) inserts.
create policy "credit_tx_owner_select" on credit_transactions for select using (auth.uid() = user_id or is_admin());

-- Shares: owner writes/reads, admin reads all for analytics.
create policy "shares_owner_all" on shares for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id);

-- Download events: owner writes/reads, admin reads all for analytics.
create policy "downloads_owner_all" on download_events for all using (auth.uid() = user_id or is_admin()) with check (auth.uid() = user_id);

-- Subscriptions: owner + admin read only; writes come from the Stripe webhook via service role.
create policy "subscriptions_owner_select" on subscriptions for select using (auth.uid() = user_id or is_admin());

-- Audit log: admins only, insert via service role from server actions.
create policy "audit_admin_select" on admin_audit_log for select using (is_admin());

-- =========================================================================
-- ATOMIC CREDIT REDEMPTION
-- Runs as a single transaction so two simultaneous requests can't both
-- spend the user's last credit (SELECT-then-UPDATE from application code
-- would race). Called via supabase.rpc('redeem_credit', ...) with the
-- service-role client only.
-- =========================================================================
create or replace function redeem_credit(p_user_id uuid, p_reason text default 'generation')
returns integer as $$
declare
  v_remaining integer;
begin
  update profiles
    set credits = credits - 1, updated_at = now()
    where id = p_user_id and credits > 0 and status = 'active'
    returning credits into v_remaining;

  if v_remaining is null then
    raise exception 'insufficient_credits';
  end if;

  insert into credit_transactions (user_id, delta, reason)
    values (p_user_id, -1, p_reason);

  return v_remaining;
end;
$$ language plpgsql security definer;

create or replace function grant_credits(p_user_id uuid, p_amount integer, p_reason text, p_admin_id uuid default null)
returns integer as $$
declare
  v_remaining integer;
begin
  update profiles
    set credits = credits + p_amount, updated_at = now()
    where id = p_user_id
    returning credits into v_remaining;

  insert into credit_transactions (user_id, delta, reason, created_by)
    values (p_user_id, p_amount, p_reason, p_admin_id);

  return v_remaining;
end;
$$ language plpgsql security definer;

-- =========================================================================
-- STORAGE BUCKETS
-- 'uploads' holds the customer's raw kitchen photos (private - only the
-- owner and admins can read them). 'renders' holds generated results and
-- is public-read so share links and <img> tags work without signed URLs.
-- =========================================================================
insert into storage.buckets (id, name, public, file_size_limit)
  values ('uploads', 'uploads', false, 10485760)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
  values ('renders', 'renders', true, 10485760)
  on conflict (id) do nothing;

create policy "uploads_owner_read" on storage.objects
  for select using (bucket_id = 'uploads' and (owner = auth.uid() or is_admin()));
create policy "uploads_owner_write" on storage.objects
  for insert with check (bucket_id = 'uploads' and owner = auth.uid());
create policy "uploads_owner_delete" on storage.objects
  for delete using (bucket_id = 'uploads' and (owner = auth.uid() or is_admin()));

create policy "renders_public_read" on storage.objects
  for select using (bucket_id = 'renders');
create policy "renders_owner_write" on storage.objects
  for insert with check (bucket_id = 'renders' and owner = auth.uid());
create policy "renders_owner_delete" on storage.objects
  for delete using (bucket_id = 'renders' and (owner = auth.uid() or is_admin()));

-- 'stone-library' holds brand logos + stone colour texture images, managed
-- only by admins, public-read so the catalog/visualiser can display them.
insert into storage.buckets (id, name, public, file_size_limit)
  values ('stone-library', 'stone-library', true, 10485760)
  on conflict (id) do nothing;

create policy "stone_library_public_read" on storage.objects
  for select using (bucket_id = 'stone-library');
create policy "stone_library_admin_write" on storage.objects
  for insert with check (bucket_id = 'stone-library' and is_admin());
create policy "stone_library_admin_update" on storage.objects
  for update using (bucket_id = 'stone-library' and is_admin());
create policy "stone_library_admin_delete" on storage.objects
  for delete using (bucket_id = 'stone-library' and is_admin());

-- =========================================================================
-- Notes
-- =========================================================================
-- 1. First super_admin must be promoted manually:
--      update profiles set role = 'super_admin' where email = 'you@company.com';
-- 2. Credit spend/grant and admin_audit_log inserts should go through server
--    routes using the service-role client (see src/lib/supabase/server.ts),
--    never directly from the browser, so RLS + business rules can't be bypassed.
-- 3. A scheduled job (Supabase Cron / Edge Function) should delete renders
--    where is_saved = false and expires_at < now(), warning users at
--    expires_at - interval '6 hours' via expiry_warned_at.
