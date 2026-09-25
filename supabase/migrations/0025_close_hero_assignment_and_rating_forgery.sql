-- Two critical RLS gaps found in a full-codebase review (2026-09-26).

-- 1. A requester could force-assign ANY other user as the hero on their
-- mission, bypassing hero_approved and is_active entirely.
--
-- 0001's "Requester or accepted hero can update a mission" policy has no
-- WITH CHECK, so it defaults to its USING clause evaluated on the NEW row:
-- auth.uid() = new.requester_id OR auth.uid() = new.hero_id. A requester
-- who leaves requester_id unchanged satisfies this trivially no matter what
-- they set hero_id to — they don't need to become the hero themselves.
--
-- Every downstream guard that's supposed to stop this is self-referential —
-- it only fires when the ACTOR is becoming the hero (new.hero_id =
-- auth.uid()): 0007's self-accept restriction only checks hero_id <>
-- requester_id (a third party still passes), 0015's inactive-hero check and
-- 0023's enforce_hero_approval_on_claim both key off "new.hero_id =
-- auth.uid()", which is false when the requester assigns someone else. A
-- requester could hand any UUID (profiles are readable by any authenticated
-- user) the hero role on their mission — unapproved or deactivated accounts
-- included — then drive the mission to 'completed' and leave that person a
-- fabricated review.
--
-- Same reasoning as 0023: this needs a trigger, not a policy, because it
-- compares old.hero_id to new.hero_id. Requiring auth.uid() = new.hero_id on
-- every real claim also restores the effectiveness of 0015's and 0023's
-- existing self-referential checks, which depended on that always being true.
create or replace function public.enforce_hero_claims_self()
returns trigger as $$
begin
  if new.hero_id is distinct from old.hero_id
     and new.hero_id is not null
     and auth.uid() is distinct from new.hero_id then
    raise exception 'Only the hero being assigned can claim a mission'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger enforce_hero_claims_self_trigger
  before update on missions
  for each row execute function public.enforce_hero_claims_self();

-- 2. Any user could forge their own hero_rating / hero_review_count.
--
-- 0001's "Users can update their own profile" policy also has no WITH CHECK
-- (defaults to USING: auth.uid() = new.id, trivially true for any self
-- update). enforce_admin_profile_update_rules' self-edit branch
-- (auth.uid() = old.id) only ever protected is_admin/hero_approved/is_active
-- — hero_rating and hero_review_count were never guarded there, so a user
-- could PATCH their own profile straight to a 5.0 rating with zero reviews.
--
-- This only extends the SELF branch. The admin-editing-someone-else branch
-- already rejects any hero_rating/hero_review_count change, and
-- handle_new_review's trigger update (0004) runs with auth.uid() = the
-- reviewer, never the hero, so it never enters this branch — unaffected.
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
