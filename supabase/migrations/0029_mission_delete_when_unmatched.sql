-- TODO.md flagged (2026-07-27): missions/reviews have no DELETE RLS at all, so
-- a real requester has no way to actually remove a mission they posted — only
-- 'cancel' (a status change) exists. Adding delete for the one case that's
-- unambiguously safe: a still-'requested' mission is unmatched, has no hero,
-- no review (reviews require status = 'completed'), and no cancellation-log
-- entry (that only gets written when a mission leaves 'requested' — see
-- 0013/0015 — and 0023 makes 'cancelled' terminal, so a row currently sitting
-- in 'requested' was never cancelled). Deleting it has no effect on any other
-- table's trust signals.
--
-- Scoped to the requester only, matching the ownership model everywhere else
-- in this schema — a hero was never assigned to a 'requested' mission, so
-- there's no hero-side case to cover here.
--
-- reviews intentionally gets no DELETE policy — left as a permanent trust
-- signal, consistent with 0025's rating-forgery fix.
create policy "Requester can delete their own unmatched mission"
  on missions for delete
  using (auth.uid() = requester_id and status = 'requested');
