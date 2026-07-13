-- Requesters could accept their own mission (requester_id === hero_id), then
-- leave themselves a review to inflate hero_rating. Neither the claim-open-
-- mission policy (0003) nor the reviews insert policy (0004) blocked this,
-- since both only checked auth.uid() against a single role, not that the two
-- roles differ. Client-side guards were added in useNearbyMissions.ts and
-- useAcceptMission.ts, but this RLS change is the actual enforcement point.
drop policy if exists "Any authenticated user can claim an open mission" on missions;

create policy "Any authenticated user can claim an open mission"
  on missions for update
  using (status = 'requested' and hero_id is null)
  with check (auth.uid() = hero_id and status = 'accepted' and requester_id <> auth.uid());

-- The check above is not enough by itself: Postgres OR's multiple permissive
-- policies for the same command together, and the pre-existing "Requester or
-- accepted hero can update a mission" policy (0001) has no explicit WITH
-- CHECK, so it defaults to its USING clause (auth.uid() = requester_id or
-- auth.uid() = hero_id) — which the requester alone satisfies, letting them
-- set hero_id = themselves regardless of the policy above. A RESTRICTIVE
-- policy is ANDed with every permissive one, so this closes that path no
-- matter which permissive policy the update goes through.
create policy "Requester and hero must never be the same person"
  on missions as restrictive for update
  with check (hero_id is null or hero_id <> requester_id);

-- Defense in depth: even if self-accept were somehow bypassed, block a
-- self-review at the final step too.
drop policy if exists "Requester can review the hero on their own completed mission" on reviews;

create policy "Requester can review the hero on their own completed mission"
  on reviews for insert
  with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from missions m
      where m.id = reviews.mission_id
        and m.status = 'completed'
        and m.requester_id = reviews.reviewer_id
        and m.hero_id = reviews.hero_id
        and m.requester_id <> m.hero_id
    )
  );
