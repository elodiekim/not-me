-- Enable UUID generation
create extension if not exists "pgcrypto";

-- profiles: one row per authenticated user. A user can act as both requester and hero,
-- so there is no separate "role" column.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  avatar_url text,
  hero_rating numeric(2, 1),
  hero_review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table missions (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references profiles (id) on delete cascade,
  hero_id uuid references profiles (id) on delete set null,
  category text not null default 'cockroach',
  reward_amount numeric(10, 2) not null,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'on_the_way', 'arrived', 'completed', 'cancelled')),
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reviews are one-directional: requester rates hero only. See PRODUCT.md "Trust & Reviews".
create table reviews (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null unique references missions (id) on delete cascade,
  reviewer_id uuid not null references profiles (id) on delete cascade,
  hero_id uuid not null references profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current on every row change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger missions_set_updated_at before update on missions
  for each row execute function set_updated_at();
create trigger reviews_set_updated_at before update on reviews
  for each row execute function set_updated_at();

-- Row Level Security
alter table profiles enable row level security;
alter table missions enable row level security;
alter table reviews enable row level security;

-- profiles: name/hero rating are a public trust signal, readable by any signed-in user.
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- missions: requester/hero see their own; any authenticated user can browse open requests
-- (this is what powers the Nearby Missions hero flow).
create policy "Missions visible to requester, hero, or as an open request"
  on missions for select
  using (
    auth.uid() = requester_id
    or auth.uid() = hero_id
    or status = 'requested'
  );

create policy "Users can create their own mission requests"
  on missions for insert
  with check (auth.uid() = requester_id);

create policy "Requester or accepted hero can update a mission"
  on missions for update
  using (auth.uid() = requester_id or auth.uid() = hero_id);

-- reviews: public trust signal, same reasoning as profiles.hero_rating.
create policy "Reviews are viewable by authenticated users"
  on reviews for select
  using (auth.role() = 'authenticated');

create policy "Requester can review the hero on their own mission"
  on reviews for insert
  with check (auth.uid() = reviewer_id);
