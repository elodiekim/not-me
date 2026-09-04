-- 0013 enabled RLS on mission_cancellations and left a comment saying "the
-- admin dashboard can read it later under its own policy" — nobody ever
-- added that policy. RLS-enabled-with-zero-policies doesn't error, it just
-- returns an empty set, so the admin dashboard's User Detail "Cancellations"
-- stat has been silently stuck at 0 for every user since it was built.
create policy "Admins can view mission cancellations"
  on mission_cancellations for select
  using (exists (
    select 1 from profiles p where p.id = auth.uid() and p.is_admin
  ));
