-- Enable Supabase Realtime (postgres_changes) for the missions table.
-- Run this ONCE in the Supabase dashboard SQL editor (or add `missions` under
-- Database -> Replication -> supabase_realtime publication).
--
-- Why: useMission subscribes to UPDATE events on missions. The subscription
-- reports SUBSCRIBED, but no events arrive until the table is in the publication.
-- Our filter uses the primary key (id) and only reads NEW, so default replica
-- identity is sufficient — no REPLICA IDENTITY FULL needed.

alter publication supabase_realtime add table public.missions;

-- Verify it's now published:
-- select schemaname, tablename from pg_publication_tables
-- where pubname = 'supabase_realtime' and tablename = 'missions';
