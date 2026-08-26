-- Auto-closes 'requested' missions nobody accepted within SEARCH_TIMEOUT_MS
-- (src/constants/mission.ts — currently 15 minutes; keep these in sync).
--
-- The existing client-side check (isRequestStale, called from MissionScreen/
-- SearchingScreen/MissionsTabScreen) only fires when the REQUESTER happens to be
-- looking at one of their own screens. NearbyMissionsScreen — what a hero actually
-- browses — has no staleness check at all, so an abandoned request (requester
-- submitted it and never came back) stays visible to every hero indefinitely.
-- A scheduled job is the only way to close those without anyone opening the app.
--
-- This supplements, not replaces, the client-side check — that one still gives
-- the requester's own screen instant feedback instead of waiting for the next
-- cron tick. Scope is deliberately narrow: only 'requested' (unmatched) missions.
-- 'accepted'/'on_the_way'/'arrived' are untouched — auto-cancelling those is a
-- separate, already-decided-against idea (see the "멈춘 미션" entry in TODO.md):
-- 'arrived' sitting still usually means the job is done and only the Complete tap
-- is missing, so the requester is warned and decides, never auto-cancelled.
create extension if not exists pg_cron;

-- pg_cron runs scheduled jobs with no JWT, so auth.uid() is null in that context —
-- the same "no session = trusted direct access" reasoning already used for SQL
-- Editor / service-role writes elsewhere (see 0015's admin-profile-update trigger).
-- Without this, the cron's UPDATE would trip the very rule it needs to run under:
-- 0012's trigger only allowed the requester or an admin to write 'cancelled', and
-- a null auth.uid() matches neither.
create or replace function public.enforce_mission_cancel_rules()
returns trigger as $$
begin
  if new.status is distinct from 'cancelled' or old.status = 'cancelled' then
    return new;
  end if;

  if old.status = 'completed' then
    raise exception 'A completed mission cannot be cancelled'
      using errcode = 'check_violation';
  end if;

  if auth.uid() is not null
     and auth.uid() is distinct from old.requester_id
     and not exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin) then
    raise exception 'Only the requester or an admin can cancel a mission'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;

-- record_mission_cancellation() (0013/0015) already only logs when
-- auth.uid() = old.requester_id, which is never true for this job (auth.uid() is
-- null) — a timeout closing an abandoned request isn't the requester walking away
-- from anything, so it correctly stays out of that trust-signal table with no
-- changes needed here, same as an admin's force-cancel.

-- Checked every 5 minutes: frequent enough that a hero never sees a request more
-- than ~20 minutes past the 15-minute cutoff, without running so often it's
-- pointless overhead on a table this size.
select cron.schedule(
  'expire-stale-mission-requests',
  '*/5 * * * *',
  $$
  update public.missions
  set status = 'cancelled'
  where status = 'requested'
    and created_at < now() - interval '15 minutes';
  $$
);
