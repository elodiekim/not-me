-- Distinguishes why a mission was cancelled. Both cases render as an identical
-- "This request was cancelled" today, which is honest for a requester who clicked
-- Cancel but misleading for one who simply never got a hero in time and did
-- nothing wrong — the two need different copy on MissionScreen.
--
-- Not folded into mission_cancellations (0013): that table answers "how often does
-- this person walk away" (a trust signal about people), while this answers "why is
-- this specific mission in this state" (a fact about the mission). A timeout isn't
-- a person walking away from anything, so mixing the two would corrupt that signal
-- — same reasoning 0015 already used to keep admin force-cancels out of it.
--
-- Nullable, and stays null on every mission cancelled before this migration: there
-- is no reliable way to tell, after the fact, whether an old cancelled-from-
-- 'requested' row was an explicit click or the opportunistic expiry check firing
-- while that screen happened to be open — both run under the requester's own
-- session and look identical in the data. Guessing would be worse than admitting
-- the gap, so the UI falls back to the old generic message when this is null.
alter table public.missions
  add column cancelled_reason text
  check (cancelled_reason is null or cancelled_reason in ('requester', 'timeout', 'admin'));

-- Point the existing cron job (0017) at the new column. Jobs already scheduled
-- reference their SQL by value, not by reference to this file, so updating the
-- migration history alone wouldn't change what's actually running — the job has
-- to be re-registered under the same name.
select cron.unschedule('expire-stale-mission-requests');

select cron.schedule(
  'expire-stale-mission-requests',
  '*/5 * * * *',
  $$
  update public.missions
  set status = 'cancelled', cancelled_reason = 'timeout'
  where status = 'requested'
    and created_at < now() - interval '15 minutes';
  $$
);
