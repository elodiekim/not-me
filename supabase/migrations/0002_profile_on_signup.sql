-- Auto-create a profiles row whenever a new auth user signs up.
-- Runs server-side (SECURITY DEFINER) so it works even before the user's
-- session/JWT exists (e.g. while email confirmation is still pending),
-- which a client-side insert right after signUp() cannot do under RLS.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', 'New Hero'));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
