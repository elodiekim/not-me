-- `profiles` SELECT (0001) has always been "any authenticated user" —
-- intentional for name/hero_rating/etc. (a public trust signal, see that
-- migration's own comment), but RLS is row-level only, so it couldn't carve
-- phone out of that same row. Confirmed via REST: any signed-in account can
-- read any other user's phone today. Moving phone to its own 1:1 table with
-- its own self-or-admin-only policy is the only way to actually separate
-- the two inside Postgres's RLS model.
--
-- This touches two repos: notme-app's useProfile/useUpdateProfile/signup
-- trigger (this migration + accompanying app changes), and notme-admin's
-- user list/detail/phone-search, which reads profiles.phone directly today
-- — coordinated in the same change per user decision, not left half-done.
create table public.profile_private (
  id uuid primary key references public.profiles(id) on delete cascade,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_private enable row level security;

create trigger profile_private_set_updated_at before update on profile_private
  for each row execute function public.set_updated_at();

create policy "Users can view their own phone"
  on profile_private for select
  using (auth.uid() = id);

create policy "Admins can view any phone"
  on profile_private for select
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

create policy "Users can insert their own phone"
  on profile_private for insert
  with check (auth.uid() = id);

create policy "Users can update their own phone"
  on profile_private for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 0016's normalization needs to follow phone to its new home — it's a
-- BEFORE INSERT OR UPDATE trigger, so this re-targets it rather than
-- redefining normalize_profile_phone() itself (that function only looks at
-- new.phone, which means the same regardless of which table's row it fires
-- on).
create trigger profile_private_normalize_phone
  before insert or update on profile_private
  for each row execute function public.normalize_profile_phone();

-- One-time backfill of whatever's already in profiles.phone (0016 already
-- normalized it in place, so no need to re-normalize here).
insert into public.profile_private (id, phone)
select id, phone from public.profiles where phone is not null;

-- handle_new_user() (0002, redefined by 0005) inserted phone straight into
-- profiles from auth metadata — now splits that into profiles (unchanged
-- shape) plus profile_private, in the same transaction. Re-declaring the
-- whole function per this project's append-only-migration convention.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'New Hero')
  );

  if new.raw_user_meta_data ->> 'phone' is not null then
    insert into public.profile_private (id, phone)
    values (new.id, new.raw_user_meta_data ->> 'phone');
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Closes the leak for data already collected, not just new writes — the
-- old trigger/policy on this column go away with the column itself.
alter table public.profiles drop column phone;
