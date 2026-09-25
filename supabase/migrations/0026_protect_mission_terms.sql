-- HIGH severity gap found in the same full-codebase review as 0025.
--
-- 0001's missions UPDATE policy only checks WHO is making the change (must
-- remain requester_id or hero_id on the new row) — it says nothing about
-- WHICH columns they're allowed to touch. reward_amount, category, address,
-- latitude, and longitude were all mutable at any time, by either party, in
-- any status, including after 'completed'/'cancelled' (0023's
-- protect_finished_missions only locks the status column itself once
-- terminal, not the rest of the row). Concretely: a hero could raise their
-- own payout after accepting, or either party could rewrite a completed
-- mission's terms after the fact — reviews and admin aggregates assume that
-- history is fixed.
--
-- No screen in the app ever edits these fields after mission creation (set
-- once at creation in RewardScreen and never revisited), so there's no
-- legitimate case to accommodate — making them immutable after insert closes
-- the gap with no behavior change for real usage.
create or replace function public.protect_mission_terms()
returns trigger as $$
begin
  if new.reward_amount is distinct from old.reward_amount
     or new.category is distinct from old.category
     or new.address is distinct from old.address
     or new.latitude is distinct from old.latitude
     or new.longitude is distinct from old.longitude then
    raise exception 'Mission terms (reward, category, address, location) cannot be changed after creation'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger protect_mission_terms_trigger
  before update on missions
  for each row execute function public.protect_mission_terms();
