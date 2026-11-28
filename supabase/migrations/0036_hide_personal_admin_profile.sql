-- notme-admin's Users screen got an Admins filter so admin accounts show
-- up like any other row (full name/phone/email, no masking) — admins
-- aren't meant to be hidden or special-cased in general. The one
-- exception is this developer's own personal account: it's real admin
-- access, not a demo/test account, and shouldn't show up anywhere else
-- reads the profiles table (admin Users/Admins list, search, CSV export,
-- any future feature) while it still works normally for itself when it
-- signs in. A flag + restrictive SELECT policy enforces that at the one
-- place every path reads profiles through, instead of special-casing
-- every query that touches this table.
alter table public.profiles add column hidden_from_others boolean not null default false;

create policy "Hidden profiles are only visible to themselves"
  on profiles as restrictive for select
  using (not hidden_from_others or auth.uid() = id);

-- One-time: mark this specific account. Keyed by email (auth.users) since
-- profiles itself doesn't store it.
update public.profiles
set hidden_from_others = true
where id = (select id from auth.users where email = 'elodiekim93@gmail.com');

-- admin_list_user_emails (0020) is SECURITY DEFINER, so the policy above
-- doesn't apply inside it — needs the same exclusion explicitly. Re-
-- declaring the whole function per this project's append-only-migration
-- convention; only the where clause changed from 0020.
create or replace function public.admin_list_user_emails(target_ids uuid[] default null)
returns table(id uuid, email text)
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin) then
    raise exception 'Only admins can list user emails'
      using errcode = 'insufficient_privilege';
  end if;

  return query
    select u.id, u.email::text
    from auth.users u
    join profiles p on p.id = u.id
    where (target_ids is null or u.id = any(target_ids))
      and (u.id = auth.uid() or not p.hidden_from_others);
end;
$$;
