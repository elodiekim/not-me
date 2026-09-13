-- Anyone who signs up can currently accept missions as a hero immediately —
-- there's no separate hero role or application step (profiles is one row per
-- user, either side). Given the app's whole premise is a stranger showing up
-- at someone's home, that's the actual trust/safety gap worth closing before
-- this goes beyond people the admin personally already knows.
--
-- Existing users are grandfathered in as approved — they're already using the
-- app, and retroactively locking out people already trusted would be a
-- regression, not a safety improvement. Only new signups start pending.
alter table public.profiles add column hero_approved boolean not null default false;
update public.profiles set hero_approved = true;

-- Same shape as 0015's "Inactive users cannot claim missions": a restrictive
-- policy ANDs with the permissive claim policy (0003/0007), so an unapproved
-- hero's claim attempt is rejected at the database regardless of what the
-- client shows them.
create policy "Unapproved heroes cannot claim missions"
  on missions as restrictive for update
  with check (
    hero_id is distinct from auth.uid()
    or exists (select 1 from profiles p where p.id = auth.uid() and p.hero_approved)
  );

-- Blocking the claim isn't enough on its own: 0001's SELECT policy already
-- lets any authenticated user read every 'requested' mission (that's what
-- powers Nearby Missions), which includes the requester's address — the exact
-- thing hero approval exists to gate. Hiding the list in the app without this
-- would be UI-only theater; an unapproved user could still pull every open
-- request's address straight from the REST API.
--
-- auth.uid() = requester_id / hero_id are kept so a mission's own requester
-- (and, defensively, its already-assigned hero — unreachable in practice
-- since claiming is blocked above, but cheap to allow) can always see it
-- regardless of their own hero_approved value; only the third "any open
-- request" clause needs approval.
create policy "Unapproved heroes cannot browse open requests"
  on missions as restrictive for select
  using (
    auth.uid() = requester_id
    or auth.uid() = hero_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.hero_approved)
  );

-- Extends the same trigger 0015/0019 already use to police self-edits and
-- admin-edits of another profile's flags. hero_approved is added to both
-- branches:
--   - Own row: blocked in EITHER direction, unlike is_active (which allows
--     turning itself off for self-delete). There's no legitimate self-service
--     case for hero_approved — approval is exclusively an admin call.
--   - Admin editing someone else: hero_approved joins is_active as an allowed
--     field, still excluding name/phone/rating/is_admin.
create or replace function public.enforce_admin_profile_update_rules()
returns trigger as $$
begin
  if auth.uid() = old.id then
    if new.is_admin is distinct from old.is_admin then
      raise exception 'Cannot change your own admin status'
        using errcode = 'insufficient_privilege';
    end if;

    if new.hero_approved is distinct from old.hero_approved then
      raise exception 'Cannot change your own hero approval status'
        using errcode = 'insufficient_privilege';
    end if;

    if new.is_active is distinct from old.is_active then
      if new.is_active then
        raise exception 'Cannot reactivate your own account'
          using errcode = 'insufficient_privilege';
      end if;
      new.deactivated_reason := 'self';
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
    raise exception 'Admins may only change is_active/hero_approved on another user''s profile'
      using errcode = 'insufficient_privilege';
  end if;

  if new.is_active is distinct from old.is_active then
    new.deactivated_reason := case when new.is_active then null else 'admin' end;
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;
