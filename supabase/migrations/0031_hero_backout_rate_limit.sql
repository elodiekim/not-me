-- Loose, non-data-calibrated safety net against a hero repeatedly
-- accepting-then-backing-out and churning the nearby-missions pool for
-- everyone else. 0013 deliberately recorded mission_cancellations without
-- building any penalty on top, since designing a real threshold needed real
-- numbers this project doesn't have yet — as of 2026-10-11 every single row
-- in mission_cancellations (and every profile in this database) traces back
-- to dev/QA testing, not actual friend usage. No organic signal exists to
-- calibrate against.
--
-- This isn't a calibrated threshold — it's a deliberately conservative "stop
-- the worst case" rule (3 hero back-outs within an hour blocks new accepts
-- for as long as 3+ stay within that trailing window), meant to be revisited
-- once real usage produces real numbers. Scoped to hero back-outs only, per
-- 0013's own reasoning: a requester cancelling their own request is a safety
-- valve (letting a stranger in), not pool abuse, and isn't rate-limited here.
--
-- Extends enforce_hero_approval_on_claim (0023) rather than adding a new
-- trigger, since both checks only matter at the same moment: hero_id
-- actually changing to the caller. Needs security definer to read
-- mission_cancellations at all — it has zero non-admin SELECT policies by
-- design (0013/0021), so without this the count would just silently see 0
-- rows and never trigger.
create or replace function public.enforce_hero_approval_on_claim()
returns trigger as $$
declare
  recent_backouts int;
begin
  if old.hero_id is distinct from new.hero_id and new.hero_id = auth.uid() then
    if not exists (select 1 from profiles p where p.id = auth.uid() and p.hero_approved) then
      raise exception 'Only approved heroes can accept missions'
        using errcode = 'insufficient_privilege';
    end if;

    select count(*) into recent_backouts
    from mission_cancellations
    where actor_id = auth.uid()
      and actor_role = 'hero'
      and created_at > now() - interval '1 hour';

    if recent_backouts >= 3 then
      raise exception 'Too many missions backed out of recently — try again later'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;
