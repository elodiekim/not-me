-- Who may cancel a mission, and from which states — enforced in the database
-- rather than only in the UI.
--
-- Until now this was a UI-level rule: MissionScreen simply hides the Cancel
-- button unless status is 'requested'. The underlying policy from 0001
-- ("Requester or accepted hero can update a mission") checks only *who* is
-- updating, never *what* the status is becoming: its USING clause is
-- (auth.uid() = requester_id or auth.uid() = hero_id) and its implicit WITH
-- CHECK re-evaluates the same expression against the NEW row, where neither id
-- has changed. So it passes for any status transition at all. Calling the REST
-- API directly, a requester could cancel a mission at any point — including one
-- already completed, which would erase the hero's completed count and earnings
-- after the fact — and a hero could cancel outright instead of backing out.
--
-- This can't be expressed as an RLS policy: USING sees only the old row and
-- WITH CHECK only the new one, so no single policy can compare the two. A
-- BEFORE UPDATE trigger can, and unlike a permissive policy it can't be
-- OR'd around by another policy (the trap hit in 0007).
--
-- The rules:
--   1. A completed mission can never be cancelled — it's a record.
--   2. Only the requester writes 'cancelled'. Heroes leave via 0011
--      (status -> 'requested', hero_id -> null), which reopens the mission for
--      someone else rather than killing the requester's request for them.
-- Cancelling from 'accepted'/'on_the_way'/'arrived' stays allowed: a requester
-- letting a stranger into their home needs a way out after seeing who accepted.
create or replace function public.enforce_mission_cancel_rules()
returns trigger as $$
begin
  -- Only transitions *into* the cancelled state are of interest here.
  if new.status is distinct from 'cancelled' or old.status = 'cancelled' then
    return new;
  end if;

  if old.status = 'completed' then
    raise exception 'A completed mission cannot be cancelled'
      using errcode = 'check_violation';
  end if;

  if auth.uid() is distinct from old.requester_id then
    raise exception 'Only the requester can cancel a mission'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

drop trigger if exists mission_cancel_rules on missions;

create trigger mission_cancel_rules
  before update on missions
  for each row execute function public.enforce_mission_cancel_rules();
