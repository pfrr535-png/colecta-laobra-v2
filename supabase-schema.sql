-- Colecta La Obra UC - Supabase schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  -- Per-event admin key: /admin/[eventId]?key=... is authorized by this
  -- value (or by the app's global ADMIN_KEY env var as a master override).
  admin_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists supermarkets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists shifts (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets (id) on delete cascade,
  start_time text not null,
  end_time text not null,
  capacity integer not null default 4,
  created_at timestamptz not null default now(),
  unique (supermarket_id, start_time)
);

create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references supermarkets (id) on delete cascade,
  shift_id uuid not null references shifts (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references volunteers (id) on delete cascade,
  supermarket_id uuid not null references supermarkets (id) on delete cascade,
  shift_id uuid not null references shifts (id) on delete cascade,
  product_name text not null,
  category text not null,
  quantity integer not null check (quantity > 0),
  item_type text not null check (item_type in ('food', 'hygiene')),
  weight_per_unit numeric,
  weight_unit text check (weight_unit in ('kg', 'lt', 'g')),
  -- total_weight is a legacy/unused duplicate of total_weight_kg kept for
  -- compatibility with older data; the app only reads total_weight_kg (and
  -- falls back to computing it from quantity/weight_per_unit/weight_unit
  -- when null, since older rows were never given a computed value).
  total_weight numeric,
  total_weight_kg numeric,
  created_at timestamptz not null default now()
);

create index if not exists idx_supermarkets_event on supermarkets (event_id);
create index if not exists idx_shifts_supermarket on shifts (supermarket_id);
create index if not exists idx_volunteers_supermarket on volunteers (supermarket_id);
create index if not exists idx_items_supermarket on items (supermarket_id);
create index if not exists idx_items_volunteer on items (volunteer_id);

-- Realtime: make sure the items table publishes changes
alter publication supabase_realtime add table items;

-- Row Level Security
-- This app has no Supabase Auth login: access is controlled entirely by
-- possession of the admin key (?key=...) or the volunteer event link.
-- The anon key therefore needs open read/write access to these tables.
alter table events enable row level security;
alter table supermarkets enable row level security;
alter table shifts enable row level security;
alter table volunteers enable row level security;
alter table items enable row level security;

create policy "public read events" on events for select using (true);
create policy "public insert events" on events for insert with check (true);
create policy "public update events" on events for update using (true);
create policy "public delete events" on events for delete using (true);

create policy "public read supermarkets" on supermarkets for select using (true);
create policy "public insert supermarkets" on supermarkets for insert with check (true);
create policy "public update supermarkets" on supermarkets for update using (true);
create policy "public delete supermarkets" on supermarkets for delete using (true);

create policy "public read shifts" on shifts for select using (true);
create policy "public insert shifts" on shifts for insert with check (true);
create policy "public update shifts" on shifts for update using (true);
create policy "public delete shifts" on shifts for delete using (true);

create policy "public read volunteers" on volunteers for select using (true);
create policy "public insert volunteers" on volunteers for insert with check (true);
create policy "public update volunteers" on volunteers for update using (true);
create policy "public delete volunteers" on volunteers for delete using (true);

create policy "public read items" on items for select using (true);
create policy "public insert items" on items for insert with check (true);
create policy "public update items" on items for update using (true);
create policy "public delete items" on items for delete using (true);
