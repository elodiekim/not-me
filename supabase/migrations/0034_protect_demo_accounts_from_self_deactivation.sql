-- The portfolio demo (?demo=1) publishes the demo requester/hero accounts'
-- credentials in the client bundle on purpose (see AuthScreen.tsx) so a
-- visitor can sign in with one tap — but that also means anyone can sign in
-- as them directly and use Settings' self-service "Delete Account" (0019),
-- which soft-deletes (is_active = false). Unlike a real user deactivating
-- their own account, this would take the shared demo account down for every
-- future visitor until someone manually flips is_active back on in the DB.
--
-- Scoped narrowly to deactivation only — these accounts still need to create
-- missions, have their profile updated by the demo bot's claim, etc. 0032's
-- is_demo_readonly (a different, unrelated demo account) blocks writes
-- entirely; this one only blocks the one specific self-destructive action.
alter table public.profiles add column is_demo_protected boolean not null default false;

update public.profiles set is_demo_protected = true
where id in (
  'df857b47-559f-45a7-b404-a5aabd693544', -- demo.user.notme@gmail.com
  '31cf67e2-020a-4ccf-bc55-18ec3114992b'  -- demo.hero.notme@gmail.com
);

-- Extends 0025's version of this trigger (the latest — self-edit branch
-- already covers is_admin/hero_approved/hero_rating/is_active). Admins
-- (the real owner, via notme-admin) are untouched — this only blocks the
-- self-service path a signed-in demo visitor could reach.
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

    if new.hero_rating is distinct from old.hero_rating
       or new.hero_review_count is distinct from old.hero_review_count then
      raise exception 'Cannot change your own hero rating'
        using errcode = 'insufficient_privilege';
    end if;

    if new.is_active is distinct from old.is_active then
      if new.is_active then
        raise exception 'Cannot reactivate your own account'
          using errcode = 'insufficient_privilege';
      end if;
      if old.is_demo_protected then
        raise exception 'This is a shared demo account and cannot be deleted'
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
