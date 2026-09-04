-- The admin dashboard's Users screen shows name/phone but never email —
-- email lives on auth.users, which the client can't query directly (same
-- reason 0014's email_is_registered exists: no client-facing API for it,
-- and the admin app deliberately never holds the Service Role Key that
-- would let it read auth.users directly — see notme-admin's CLAUDE.md).
--
-- Same shape as 0014: a narrow SECURITY DEFINER function, not a view or a
-- relaxed RLS policy on auth.users. Gated to admins only — checked inside
-- the function, not left to the caller, so it fails safe.
-- target_ids narrows to specific users (Mission/User Detail needs one row,
-- not the whole table); left null it returns everyone (Users list).
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
    where target_ids is null or u.id = any(target_ids);
end;
$$;

revoke all on function public.admin_list_user_emails(uuid[]) from public;
grant execute on function public.admin_list_user_emails(uuid[]) to authenticated;
