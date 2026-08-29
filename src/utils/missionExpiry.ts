import { SEARCH_TIMEOUT_MS, STALLED_MISSION_MS } from '../constants/mission';

/** Milliseconds remaining until a 'requested' mission goes stale (negative once past). */
export function millisUntilStale(createdAt: string): number {
  return SEARCH_TIMEOUT_MS - (Date.now() - new Date(createdAt).getTime());
}

export function isRequestStale(createdAt: string): boolean {
  return millisUntilStale(createdAt) <= 0;
}

/**
 * True once an accepted mission has sat without any status change for too long —
 * the signal that a hero may have gone quiet.
 *
 * Measured from updatedAt, not createdAt: the missions_set_updated_at trigger
 * bumps it on every status change, so this reads as "no progress since", which
 * keeps a slow-but-moving mission from being flagged.
 *
 * Only a signal for the requester, never an automatic action — see the caller.
 */
export function isMissionStalled(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() >= STALLED_MISSION_MS;
}

/**
 * Whole minutes since a 'requested' mission was created — lets the requester see
 * how long the search has been running instead of a silent spinner with a hidden
 * 15-minute cutoff (SEARCH_TIMEOUT_MS) nobody's told about.
 *
 * Not a countdown to that cutoff on purpose: showing "X min left" turns waiting
 * for help into a countdown to failure, which is the wrong tone for someone
 * already dealing with a stressful situation. Elapsed time reads as progress
 * instead.
 *
 * Same caveat as isMissionStalled: computed from Date.now() at render time, so it
 * only advances when this data actually refetches (poll/realtime), not live by
 * the second. Fine at minute granularity.
 */
export function elapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}
