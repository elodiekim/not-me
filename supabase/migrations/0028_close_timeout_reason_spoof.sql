-- LOW-MEDIUM severity gap found in the same full-codebase review as 0025-0027.
--
-- 0024 closed two spoof directions on cancelled_reason: a requester tagging
-- their own cancellation 'admin', and an admin's force-cancel getting tagged
-- 'requester'/'timeout'. It never closed the mirror case its own comment
-- worried about ("making it look like the platform stepped in") in reverse:
-- a requester manually cancelling and tagging it 'timeout' — making it look
-- like nobody's fault instead of admitting they backed out.
--
-- This can't just be "requester can never write timeout", though: MissionScreen
-- and SearchingScreen's opportunistic-expiry effect (0017's comment) has the
-- REQUESTER's own session write cancelled_reason='timeout' for real, as a
-- same-session-open shortcut ahead of the next cron tick. Both the genuine
-- and the spoofed case have auth.uid() = old.requester_id — the only thing
-- that actually distinguishes them is whether the mission is old enough to
-- really be a timeout. Reusing the same 15-minute cutoff the client
-- (SEARCH_TIMEOUT_MS) and cron (0017/0018) already use lets a requester tag
-- 'timeout' only when it's actually been that long, closing the spoof without
-- touching the legitimate path.
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

  -- A null auth.uid() means cron (0017) or a direct service-role/SQL-editor
  -- write — both already fully trusted elsewhere in this schema (0015), so
  -- skip actor checks entirely for that case.
  if auth.uid() is not null then
    if auth.uid() is distinct from old.requester_id
       and not exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin) then
      raise exception 'Only the requester or an admin can cancel a mission'
        using errcode = 'insufficient_privilege';
    end if;

    if auth.uid() = old.requester_id and new.cancelled_reason = 'admin' then
      raise exception 'A requester cannot attribute their own cancellation to an admin'
        using errcode = 'insufficient_privilege';
    end if;

    if auth.uid() = old.requester_id
       and new.cancelled_reason = 'timeout'
       and old.created_at >= now() - interval '15 minutes' then
      raise exception 'A request less than 15 minutes old cannot be tagged as timed out'
        using errcode = 'insufficient_privilege';
    end if;

    if auth.uid() is distinct from old.requester_id and new.cancelled_reason in ('requester', 'timeout') then
      raise exception 'An admin cancellation must be recorded as cancelled_reason = admin'
        using errcode = 'insufficient_privilege';
    end if;
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;
