-- Heroes had no way to back out of a mission once accepted — status could only move
-- forward (accepted -> on_the_way -> arrived -> completed). Without an exit, a hero
-- who can no longer make it (car trouble, plans changed) leaves the mission stuck
-- forever with no path back to the open pool for another hero to pick up.
--
-- Neither existing UPDATE policy covers this transition:
--   - "Requester or accepted hero can update a mission" (0001) has no explicit WITH
--     CHECK, so it defaults to its USING clause (auth.uid() = requester_id or
--     auth.uid() = hero_id) evaluated against the NEW row — but the new row clears
--     hero_id to null, so `auth.uid() = hero_id` is false and the current user isn't
--     the requester either.
--   - "Any authenticated user can claim an open mission" (0003/0007) requires the OLD
--     row's status to already be 'requested', which an accepted mission isn't.
--
-- This adds a narrowly-scoped permissive policy just for a hero un-assigning
-- themselves from their own not-yet-completed mission, resetting it back to an open
-- request. The 0007 restrictive policy (hero_id is null or hero_id <> requester_id)
-- still applies on top and passes trivially since the new hero_id is null.
create policy "Hero can back out of an accepted mission"
  on missions for update
  using (auth.uid() = hero_id and status in ('accepted', 'on_the_way', 'arrived'))
  with check (status = 'requested' and hero_id is null);
