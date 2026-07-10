-- Add optional coordinates to missions, captured from the requester's device at
-- creation time. Nullable — existing rows and users who deny location permission
-- have no coordinates, and Nearby Missions falls back to no distance shown.
alter table public.missions add column latitude double precision;
alter table public.missions add column longitude double precision;

-- No RLS change needed: existing missions policies already cover full rows
-- (select/insert/update), so the new columns are automatically included.
