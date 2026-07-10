import { SEARCH_TIMEOUT_MS } from '../constants/mission';

/** Milliseconds remaining until a 'requested' mission goes stale (negative once past). */
export function millisUntilStale(createdAt: string): number {
  return SEARCH_TIMEOUT_MS - (Date.now() - new Date(createdAt).getTime());
}

export function isRequestStale(createdAt: string): boolean {
  return millisUntilStale(createdAt) <= 0;
}
