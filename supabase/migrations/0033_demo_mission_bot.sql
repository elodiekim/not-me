-- Demo bot for the portfolio site: a lone visitor plays "User" against a
-- fixed demo Hero account, and pg_cron advances the Hero's side of the loop
-- so nobody has to be online to accept the request. Same approach as 0017 —
-- a scheduled job, not a new backend.
--
-- Fixed demo accounts (created earlier for portfolio screenshot capture,
-- verified still usable):
--   requester: demo.user.notme@gmail.com  = df857b47-559f-45a7-b404-a5aabd693544
--   hero:      demo.hero.notme@gmail.com  = 31cf67e2-020a-4ccf-bc55-18ec3114992b
-- Neither has is_demo_readonly set (that's 0032's unrelated admin-demo
-- account) — this requester needs to actually create and complete missions.

-- First, a blocker this job would otherwise hit: 0025's enforce_hero_claims_self
-- requires auth.uid() = new.hero_id whenever hero_id is being set to a
-- non-null value, with no exception for a null auth.uid(). Every other
-- trigger that had to become cron/service-role-safe (0017's and 0028's
-- versions of enforce_mission_cancel_rules) got the same "auth.uid() is null
-- means cron or a direct trusted write, skip the actor check" exception —
-- this one never needed it before because no existing cron job ever touched
-- hero_id. This is the first one that does. Without this fix, the claim step
-- below would fail: auth.uid() is null under pg_cron, and
-- `null is distinct from <any uuid>` evaluates true (not null), so the
-- trigger would raise on every attempt.
create or replace function public.enforce_hero_claims_self()
returns trigger as $$
begin
  if auth.uid() is not null
     and new.hero_id is distinct from old.hero_id
     and new.hero_id is not null
     and auth.uid() is distinct from new.hero_id then
    raise exception 'Only the hero being assigned can claim a mission'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$ language plpgsql set search_path = public;

-- Every statement below is scoped to requester_id = the demo requester's id
-- alone — it can never touch a real user's mission regardless of status.
-- Each WHERE mirrors the exact fromStatus guard the real app uses for that
-- transition (useAcceptMission.ts's status='requested', hero_id is null;
-- useUpdateMissionStatus.ts's status=fromStatus for the rest), so this can
-- never silently skip a rule the real path enforces. RLS itself doesn't
-- apply to this job at all — pg_cron runs as the table owner, and missions
-- has no FORCE ROW LEVEL SECURITY (same situation 0017/0022 already note) —
-- so the trigger fix above, not any policy, is what actually keeps this
-- scoped and safe.
--
-- The three forward steps after claiming each wait for 8s to have passed
-- since the previous step's updated_at before firing, so a 10s tick doesn't
-- resolve the whole lifecycle in one pass — closer to the pacing of a real
-- Hero moving through the flow, without being slow enough to lose a
-- visitor's attention. Claiming itself has no such wait: it fires on the
-- very next tick (within 10s of the request), which is the realistic part —
-- someone nearby accepting quickly.
select cron.schedule(
  'advance-demo-missions',
  '10 seconds',
  $$
  update public.missions
  set hero_id = '31cf67e2-020a-4ccf-bc55-18ec3114992b', status = 'accepted'
  where requester_id = 'df857b47-559f-45a7-b404-a5aabd693544'
    and status = 'requested'
    and hero_id is null;

  update public.missions
  set status = 'on_the_way'
  where requester_id = 'df857b47-559f-45a7-b404-a5aabd693544'
    and status = 'accepted'
    and updated_at < now() - interval '8 seconds';

  update public.missions
  set status = 'arrived'
  where requester_id = 'df857b47-559f-45a7-b404-a5aabd693544'
    and status = 'on_the_way'
    and updated_at < now() - interval '8 seconds';

  update public.missions
  set status = 'completed'
  where requester_id = 'df857b47-559f-45a7-b404-a5aabd693544'
    and status = 'arrived'
    and updated_at < now() - interval '8 seconds';
  $$
);
