-- Admin dashboard support: an `is_admin` flag to gate access (see notme-admin/ADMIN.md)
-- and an `is_active` flag so admins can disable problem accounts without touching
-- Supabase Auth directly. Keeping this a plain profiles flag (instead of the Supabase
-- Auth admin/ban API) means the admin app never needs the Service Role Key at all —
-- see notme-admin/CLAUDE.md's "Architecture Notes".
alter table public.profiles add column is_admin boolean not null default false;
alter table public.profiles add column is_active boolean not null default true;

-- profiles are already fully readable by any authenticated user (0001's "Profiles are
-- viewable by authenticated users"), so both new flags ride along on that policy — no
-- new SELECT policy needed. is_admin is assigned manually via SQL per ADMIN.md — there's
-- no UI path to set your own — but 0001's "own profile" update policy has no explicit
-- WITH CHECK, so it defaults to reusing USING (auth.uid() = id), which never looks at
-- what's being written. Absent a UI path isn't the same as blocked: a direct REST PATCH
-- to your own row could set is_admin = true today. Closed below, in the same trigger
-- that already governs admin-on-someone-else's-row updates.

-- Admins need to see every mission, not just their own — the existing SELECT policy
-- (0001) only covers "mine, or still open".
create policy "Admins can view all missions"
  on missions for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));

-- Admins need to be able to write status = 'cancelled' on a mission they're neither
-- requester nor hero of. None of the existing UPDATE policies cover a third party.
create policy "Admins can cancel any mission"
  on missions for update
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ))
  with check (status = 'cancelled');

-- The 0012 trigger hard-blocks anyone but the requester from writing 'cancelled' —
-- RLS and the trigger are independent gates, so passing the policy above isn't
-- enough on its own; the trigger would still 403 an admin. Extend the actor check to
-- allow admins too, for the admin dashboard's "Cancel Mission" action (stuck/
-- abandoned missions). The "completed missions can never be cancelled" rule is
-- untouched — admins don't get to rewrite history either.
create or replace function public.enforce_mission_cancel_rules()
returns trigger as $$
begin
  if new.status is distinct from 'cancelled' or old.status = 'cancelled' then
    return new;
  end if;

  if old.status = 'completed' then
    raise exception 'A completed mission cannot be cancelled'
      using errcode = 'check_violation';
  end if;

  if auth.uid() is distinct from old.requester_id
     and not exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin) then
    raise exception 'Only the requester or an admin can cancel a mission'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

-- 0013 logs every requester/hero cancellation as a trust-signal input ("how often
-- does this person walk away"). An admin force-cancelling a stuck mission isn't the
-- requester walking away from anything, so attributing it to them would corrupt that
-- signal. Only log when the actor actually is the requester; admin cancels are
-- visible on the mission itself (status + updated_at) without polluting this table.
create or replace function public.record_mission_cancellation()
returns trigger as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    if auth.uid() = old.requester_id then
      insert into mission_cancellations (mission_id, actor_id, actor_role, from_status)
      values (old.id, old.requester_id, 'requester', old.status);
    end if;
  elsif old.hero_id is not null and new.hero_id is null and new.status = 'requested' then
    insert into mission_cancellations (mission_id, actor_id, actor_role, from_status)
    values (old.id, old.hero_id, 'hero', old.status);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Disabled accounts shouldn't be able to start new activity, but shouldn't be trapped
-- mid-mission either — they can still cancel their own request or back out as hero.
-- Restrictive policies AND with every permissive one for the same command, so scope
-- these to exactly the two "starting something new" transitions: creating a request,
-- and claiming an open one as hero.
create policy "Inactive users cannot create missions"
  on missions as restrictive for insert
  with check (exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_active
  ));

create policy "Inactive users cannot claim missions"
  on missions as restrictive for update
  with check (
    hero_id is distinct from auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_active)
  );

-- Admins need to flip is_active on someone ELSE's profile (Enable/Disable Account),
-- but nothing else about that row — not their own admin flag, not another user's
-- name/rating/phone. RLS's WITH CHECK only sees the NEW row, so it can't compare
-- column-by-column against OLD; a trigger can (same reasoning as 0012's cancel-rules
-- trigger).
create policy "Admins can update another user's active flag"
  on profiles for update
  using (
    auth.uid() <> id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (true);

create or replace function public.enforce_admin_profile_update_rules()
returns trigger as $$
begin
  if auth.uid() = old.id then
    -- Own-row update — otherwise covered by the existing "own profile" policy, but
    -- neither flag is yours to change on yourself: is_admin because that's a
    -- self-escalation, is_active because otherwise a disabled account could just
    -- PATCH itself back to active, defeating the admin dashboard's Disable Account
    -- action entirely. SQL Editor / service-role changes are unaffected: those run
    -- with no JWT, so auth.uid() is null there and this branch is never entered.
    if new.is_admin is distinct from old.is_admin then
      raise exception 'Cannot change your own admin status'
        using errcode = 'insufficient_privilege';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'Cannot change your own active status'
        using errcode = 'insufficient_privilege';
    end if;
    return new;
  end if;

  if not exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin) then
    return new; -- not an admin update; not this trigger's concern
  end if;

  if new.name is distinct from old.name
     or new.avatar_url is distinct from old.avatar_url
     or new.phone is distinct from old.phone
     or new.hero_rating is distinct from old.hero_rating
     or new.hero_review_count is distinct from old.hero_review_count
     or new.is_admin is distinct from old.is_admin then
    raise exception 'Admins may only change is_active on another user''s profile'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists admin_profile_update_rules on profiles;

create trigger admin_profile_update_rules
  before update on profiles
  for each row execute function public.enforce_admin_profile_update_rules();
