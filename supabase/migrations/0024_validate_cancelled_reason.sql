-- enforce_mission_cancel_rules() (0012/0017) validates WHO may write
-- status='cancelled', but never touches cancelled_reason (0018) — a requester
-- calling the REST API directly could cancel their own mission and tag it
-- cancelled_reason='admin' (making it look like the platform stepped in
-- rather than admitting they backed out), or an admin's force-cancel could
-- get tagged 'requester'. record_mission_cancellation (0013/0015) keys off
-- auth.uid() rather than this column, so the cancellation rate-limit signal
-- isn't corrupted by this — it's purely a client-trusted value shown as-is
-- in MissionScreen's copy ("timed out" vs "you cancelled"), but it shouldn't
-- be freely fakeable either.
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

    if auth.uid() is distinct from old.requester_id and new.cancelled_reason in ('requester', 'timeout') then
      raise exception 'An admin cancellation must be recorded as cancelled_reason = admin'
        using errcode = 'insufficient_privilege';
    end if;
  end if;

  return new;
end;
$$ language plpgsql set search_path = public;
