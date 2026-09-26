-- MEDIUM severity gap found in the same full-codebase review as 0025/0026.
--
-- 0022's "Unapproved heroes cannot browse open requests" is a RESTRICTIVE
-- policy, so it ANDs against every permissive policy regardless of which one
-- would otherwise grant access — including 0015's "Admins can view all
-- missions". As written it has no is_admin clause, so an admin who isn't a
-- party to a given mission only sees it if their OWN profile happens to have
-- hero_approved = true. Existing accounts were grandfathered to
-- hero_approved = true when 0022 ran, so this went unnoticed, but any admin
-- account created afterward starts hero_approved = false and would silently
-- lose "view all missions" despite 0015's stated intent.
drop policy if exists "Unapproved heroes cannot browse open requests" on missions;

create policy "Unapproved heroes cannot browse open requests"
  on missions as restrictive for select
  using (
    auth.uid() = requester_id
    or auth.uid() = hero_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.hero_approved)
    or exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin)
  );
