-- Found by qa-seed's own rating-recalculation check (added this session):
-- handle_new_review() (0004) only ever fired `after insert on reviews`.
-- Reviews can disappear via cascade (reviews.mission_id references missions
-- on delete cascade — deleting a 'completed' mission from the SQL editor, or
-- any owner-level cleanup, takes its review with it), but nothing recomputed
-- hero_rating/hero_review_count when that happened — the cached numbers stay
-- stale (overstated) until the next unrelated review happens to force a
-- recalculation. That's exactly what qa-seed's check caught: a count that
-- dropped from a large stale number to the true one only once a fresh review
-- came in.
--
-- Rewritten to handle both INSERT and DELETE via coalesce(new.hero_id,
-- old.hero_id) — DELETE triggers have no NEW row, INSERT triggers have no OLD
-- row. No UPDATE case needed: reviews has no UPDATE RLS policy, so a review's
-- rating can never change after creation.
create or replace function public.handle_new_review()
returns trigger as $$
declare
  affected_hero_id uuid := coalesce(new.hero_id, old.hero_id);
begin
  update public.profiles
  set hero_rating = (
        select round(avg(rating)::numeric, 1) from public.reviews where hero_id = affected_hero_id
      ),
      hero_review_count = (
        select count(*) from public.reviews where hero_id = affected_hero_id
      )
  where id = affected_hero_id;
  return coalesce(new, old);
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_review_deleted
  after delete on reviews
  for each row execute function public.handle_new_review();

-- One-time repair: recompute every profile's cached rating/count from the
-- reviews table (the actual source of truth) so any already-stale values
-- from past cascade-deletes are corrected now, not just going forward.
update public.profiles p
set hero_rating = sub.avg_rating,
    hero_review_count = sub.review_count
from (
  select hero_id,
         round(avg(rating)::numeric, 1) as avg_rating,
         count(*) as review_count
  from public.reviews
  group by hero_id
) sub
where p.id = sub.hero_id
  and (p.hero_rating is distinct from sub.avg_rating or p.hero_review_count is distinct from sub.review_count);

-- Heroes with zero remaining reviews aren't covered by the join above (no row
-- in `sub`) — reset those explicitly instead of leaving a stale count/rating.
update public.profiles p
set hero_rating = null,
    hero_review_count = 0
where p.hero_review_count > 0
  and not exists (select 1 from public.reviews r where r.hero_id = p.id);
