-- Tighten reviews INSERT policy: the previous version only checked
-- auth.uid() = reviewer_id, which let anyone insert a review row for any
-- mission/hero pair as long as they claimed to be the reviewer. Require that
-- the mission actually exists, is completed, and that reviewer_id/hero_id
-- match that mission's requester_id/hero_id.
drop policy if exists "Requester can review the hero on their own mission" on reviews;

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
    )
  );

-- Keep profiles.hero_rating / hero_review_count in sync whenever a review
-- comes in. Runs as the table owner (SECURITY DEFINER) since the reviewer
-- updating the HERO's profile row wouldn't otherwise pass the
-- "Users can update their own profile" policy (auth.uid() = id).
create or replace function public.handle_new_review()
returns trigger as $$
begin
  update public.profiles
  set hero_rating = (
        select round(avg(rating)::numeric, 1) from public.reviews where hero_id = new.hero_id
      ),
      hero_review_count = (
        select count(*) from public.reviews where hero_id = new.hero_id
      )
  where id = new.hero_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_review_created
  after insert on reviews
  for each row execute function public.handle_new_review();
