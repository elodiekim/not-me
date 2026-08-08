-- Lets the sign-up form say "this email already has an account" while the user is
-- still on the email field, instead of after they've filled in name, phone and
-- both password boxes.
--
-- Supabase has no API for this on purpose: it will not tell a client whether an
-- address is registered. signUp is the only thing that knows, and it answers in
-- two different shapes depending on the Confirm-email setting (a decoy user with
-- an empty identities array when it's on, a user_already_exists error when it's
-- off) — either way, only once the whole form has been submitted.
--
-- So the check has to be built here. This is deliberately an account-enumeration
-- oracle, which is exactly what Supabase's default behaviour avoids, and the
-- trade-off was made knowingly: telling people their email is taken is what most
-- consumer products do (GitHub, Google, Amazon), the existing signUp response
-- already leaks it via identities, and someone waiting on a confirmation email
-- that is never coming is the worse outcome. Revisit if NotMe ever holds data
-- where "does this person use it" is itself sensitive.
--
-- Kept as narrow as possible: takes one address, returns one boolean, never
-- returns a row, a count, or anything about the account. Supabase's gateway rate
-- limits are the only throttle — if this is ever abused, add one here.
create or replace function public.email_is_registered(check_email text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(trim(check_email))
  );
$$;

-- security definer runs as the owner, so grants are the whole access control here.
revoke all on function public.email_is_registered(text) from public;
grant execute on function public.email_is_registered(text) to anon, authenticated;
