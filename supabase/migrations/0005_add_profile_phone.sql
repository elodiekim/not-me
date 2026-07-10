-- Add an optional phone number to profiles, collected during sign-up.
-- Nullable so existing users (created before this column) stay valid.
-- No unique constraint here — out of scope; revisit if verification is added.
alter table public.profiles add column phone text;

-- Redefine handle_new_user() so the sign-up trigger also stores the phone
-- passed via auth metadata (options.data.phone). We re-declare the whole
-- function instead of editing 0002 — migrations are an append-only history.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', 'New Hero'),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
