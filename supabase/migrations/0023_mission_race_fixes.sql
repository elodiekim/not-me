-- Two related correctness gaps found in a full-codebase review (2026-09-18).

-- 1. A completed/cancelled mission could still be reverted.
--
-- useCancelAcceptedMission (hero backing out) filters only on hero_id, not
-- status, and 0022's "Unapproved heroes cannot claim missions" restrictive
-- check only fires when the NEW hero_id is being set to you — it passes
-- trivially when hero_id is being cleared to null. Meanwhile 0001's original
-- "Requester or accepted hero can update a mission" policy allows a hero to
-- update a row in ANY status, not just non-terminal ones. Combined, a hero
-- could flip a mission back to status='requested', hero_id=null even after it
-- reached 'completed' — most concretely as a race with ActiveMissionScreen's
-- own Complete button: tap Cancel, then Complete before the first request
-- resolves, and whichever the database applies last wins with no client-side
-- indication of which happened.
--
-- Fixed with a general invariant rather than patching each transition
-- individually: once a mission is 'completed' or 'cancelled', its status can
-- never change again, by anyone, through any policy. This needs a trigger, not
-- an RLS policy — the check is old.status vs new.status, and WITH CHECK can't
-- see the old row (same reasoning as 0012's cancel-rules trigger).
create or replace function public.protect_finished_missions()
returns trigger as $$
begin
  if old.status in ('completed', 'cancelled') and new.status is distinct from old.status then
    raise exception 'A % mission cannot be modified further', old.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger protect_finished_missions
  before update on missions
  for each row execute function public.protect_finished_missions();

-- 2. hero_approved being revoked later blocks a hero's already-in-flight mission.
--
-- 0022's restrictive claim policy checked `hero_id is distinct from auth.uid()`
-- — true only when you're NOT (about to be) the hero. But for a hero
-- progressing their OWN already-accepted mission (on_the_way, arrived,
-- completed), hero_id stays equal to auth.uid() on every update, so this
-- policy re-evaluates on every single status change, not just the original
-- claim. If that hero's hero_approved is ever later set to false (an admin
-- action the trigger from 0022 explicitly permits, in either direction), every
-- subsequent update to their own in-flight mission would incorrectly fail —
-- someone approved when they accepted would get retroactively locked out of
-- finishing a mission already underway.
--
-- Rewritten as a trigger (same old-vs-new limitation as above): only the
-- moment hero_id actually changes TO you is a claim and needs hero_approved;
-- an update that leaves hero_id unchanged is never a claim, regardless of its
-- current value.
drop policy if exists "Unapproved heroes cannot claim missions" on missions;

create or replace function public.enforce_hero_approval_on_claim()
returns trigger as $$
begin
  if old.hero_id is distinct from new.hero_id
     and new.hero_id = auth.uid()
     and not exists (select 1 from profiles p where p.id = auth.uid() and p.hero_approved) then
    raise exception 'Only approved heroes can accept missions'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

create trigger enforce_hero_approval_on_claim
  before update on missions
  for each row execute function public.enforce_hero_approval_on_claim();

-- The SELECT-side restrictive policy from 0022 ("Unapproved heroes cannot
-- browse open requests") has no old/new row to compare — it's a straight
-- visibility check per row — so it doesn't have this bug and is unchanged.
