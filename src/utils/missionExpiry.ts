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
