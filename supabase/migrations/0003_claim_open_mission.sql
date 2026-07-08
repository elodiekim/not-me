-- The existing "Requester or accepted hero can update a mission" policy only
-- covers updates by whoever is ALREADY the requester or hero. It can't cover
-- the moment a Hero claims an unassigned mission, since hero_id is still null
-- at that point. Add a second permissive policy just for that transition.
create policy "Any authenticated user can claim an open mission"
  on missions for update
  using (status = 'requested' and hero_id is null)
  with check (auth.uid() = hero_id and status = 'accepted');
