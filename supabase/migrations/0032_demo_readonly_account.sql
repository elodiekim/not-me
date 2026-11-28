-- The portfolio site will publish a demo admin login so visitors can click
-- around the live notme-admin dashboard themselves instead of just watching a
-- recording. That account must never be able to mutate real data. Same
-- restrictive-policy pattern as 0015's "Inactive users cannot create
-- missions": a restrictive policy ANDs with every permissive policy for the
-- same command, so one flag blocks this one account's writes everywhere
-- (both the admin app and the consumer app, since it's the same Supabase
-- account either way) without touching any existing admin/consumer policy.
alter table public.profiles add column is_demo_readonly boolean not null default false;

create policy "Demo readonly account cannot update profiles"
  on profiles as restrictive for update
  with check (not exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_demo_readonly
  ));

create policy "Demo readonly account cannot create missions"
  on missions as restrictive for insert
  with check (not exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_demo_readonly
  ));

create policy "Demo readonly account cannot update missions"
  on missions as restrictive for update
  with check (not exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_demo_readonly
  ));

create policy "Demo readonly account cannot delete missions"
  on missions as restrictive for delete
  using (not exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_demo_readonly
  ));

create policy "Demo readonly account cannot create reviews"
  on reviews as restrictive for insert
  with check (not exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_demo_readonly
  ));
