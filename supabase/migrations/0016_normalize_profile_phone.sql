-- profiles.phone has been free text since 0005: sign-up and Edit Profile both accept
-- digits plus '+', '-', spaces, and parens (see AuthScreen/EditProfileScreen's shared
-- phoneValid regex), and neither normalizes before saving. So the same number ends up
-- stored as "010-1234-5678", "+82 10 1234 5678", "(010) 1234-5678", etc. depending on
-- how each person typed it — which is what showed up as inconsistent formatting in the
-- admin dashboard's user list.
--
-- Normalizing in a trigger rather than in the client keeps this a single source of
-- truth: it covers sign-up (handle_new_user's insert from auth metadata), Edit Profile
-- (a plain update), and any future write path (e.g. an admin editing a phone number)
-- without needing the same regex duplicated in every caller.
create or replace function public.normalize_profile_phone()
returns trigger as $$
begin
  if new.phone is not null then
    new.phone := nullif(regexp_replace(new.phone, '[^0-9]', '', 'g'), '');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger profiles_normalize_phone
  before insert or update on profiles
  for each row execute function public.normalize_profile_phone();

-- One-time cleanup: the trigger only normalizes rows written from now on, so existing
-- data needs this backfill too.
update public.profiles
set phone = nullif(regexp_replace(phone, '[^0-9]', '', 'g'), '')
where phone is not null;
