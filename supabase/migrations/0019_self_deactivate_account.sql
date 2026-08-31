-- Lets a user delete their own account, implemented as the same is_active flag
-- 0015 gave admins for disabling problem accounts — soft-delete, not a real
-- DELETE, for the same reason this project never added DELETE RLS on
-- missions/reviews: erasing the row would cascade-erase other people's trust
-- data (a hero's completed-mission history, reviews they received).
--
-- 0015's trigger blocked a user from touching their own is_active in either
-- direction (so a disabled account couldn't just PATCH itself back on). That's
-- now split by direction: turning it off (self-delete) is allowed, turning it
-- on (self-reactivate) is still blocked. An admin can still flip it either way
-- for someone else's row, unchanged from 0015.
--
-- deactivated_reason distinguishes "left on their own" from "an admin disabled
-- them" for the admin dashboard's user list. Always server-set from which
-- branch of this trigger fired, never taken from client input, so it can't be
-- spoofed — same reasoning as mission_cancellations' actor attribution.
alter table public.profiles
  add column deactivated_reason text
  check (deactivated_reason is null or deactivated_reason in ('self', 'admin'));

create or replace function public.enforce_admin_profile_update_rules()
returns trigger as $$
begin
  if auth.uid() = old.id then
    if new.is_admin is distinct from old.is_admin then
      raise exception 'Cannot change your own admin status'
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
    raise exception 'Admins may only change is_active on another user''s profile'
      using errcode = 'insufficient_privilege';
  end if;

  if new.is_active is distinct from old.is_active then
    new.deactivated_reason := case when new.is_active then null else 'admin' end;
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;
