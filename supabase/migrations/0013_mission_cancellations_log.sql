-- An append-only record of who walked away from a mission, and from which state.
--
-- Both sides can now leave: a requester cancels outright (status -> 'cancelled')
-- and a hero backs out via 0011 (status -> 'requested', hero_id -> null, which
-- reopens the mission for someone else). Both cost the other person something,
-- but there is currently no way to see how often either happens.
--
-- This only records. No penalty, no rate limit, nothing user-facing — those need
-- real numbers to calibrate, and right now we have none. Guessing at a threshold
-- would risk penalising the requester's safety valve (backing out of letting a
-- stranger in) or pushing heroes into silently no-showing instead of backing out
-- honestly, which is worse for everyone.
--
-- from_status is the cost signal: leaving a 'requested' mission costs nothing
-- (nobody was committed yet, and this also covers the opportunistic staleness
-- expiry), while leaving from 'accepted'/'on_the_way'/'arrived' means someone
-- was already en route.
create table mission_cancellations (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions (id) on delete cascade,
  -- Nullable so a deleted account doesn't drop the rest of the record.
  actor_id uuid references profiles (id) on delete set null,
  actor_role text not null check (actor_role in ('requester', 'hero')),
  from_status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The question this table exists to answer is always "how often does this person
-- walk away", so index by actor rather than by mission.
create index mission_cancellations_actor_idx
  on mission_cancellations (actor_id, created_at desc);

-- No SELECT/INSERT/UPDATE/DELETE policies: RLS denies every command it has no
-- policy for, so this is unreachable from the client. The trigger below writes
-- it as the table owner, and the admin dashboard can read it later under its own
-- policy. Nothing in the app needs to see it.
alter table mission_cancellations enable row level security;

create or replace function public.record_mission_cancellation()
returns trigger as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    insert into mission_cancellations (mission_id, actor_id, actor_role, from_status)
    values (old.id, old.requester_id, 'requester', old.status);
  elsif old.hero_id is not null and new.hero_id is null and new.status = 'requested' then
    insert into mission_cancellations (mission_id, actor_id, actor_role, from_status)
    values (old.id, old.hero_id, 'hero', old.status);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- AFTER, so only transitions that actually survived the cancel rules in 0012
-- get recorded.
create trigger on_mission_cancelled
  after update on missions
  for each row execute function public.record_mission_cancellation();
