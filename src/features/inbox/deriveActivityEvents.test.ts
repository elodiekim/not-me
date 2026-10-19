import type { MissionHistoryEntry } from '../../hooks/useMissionHistory';
import { deriveActivityEvents } from './deriveActivityEvents';

function entry(overrides: Partial<MissionHistoryEntry>): MissionHistoryEntry {
  return {
    id: 'mission-1',
    requesterId: 'requester-1',
    heroId: 'hero-1',
    category: 'cockroach',
    rewardAmount: 20,
    status: 'requested',
    cancelledReason: null,
    address: 'Somewhere',
    latitude: null,
    longitude: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    role: 'user',
    hasReview: false,
    counterpartName: 'Minjun',
    reviewRating: null,
    ...overrides,
  };
}

describe('deriveActivityEvents — user role', () => {
  it('reports the hero accepting', () => {
    const [event] = deriveActivityEvents([entry({ status: 'accepted' })]);
    expect(event.message).toBe('Minjun님이 요청을 수락했어요');
  });

  it('reports the hero on the way', () => {
    const [event] = deriveActivityEvents([entry({ status: 'on_the_way' })]);
    expect(event.message).toBe('Minjun님이 가는 중이에요');
  });

  it('reports the hero arriving', () => {
    const [event] = deriveActivityEvents([entry({ status: 'arrived' })]);
    expect(event.message).toBe('Minjun님이 도착했어요');
  });

  it('falls back to a generic label when counterpartName is null', () => {
    const [event] = deriveActivityEvents([entry({ status: 'accepted', counterpartName: null })]);
    expect(event.message).toBe('히어로님이 요청을 수락했어요');
  });

  it('prompts for a review once completed and not yet reviewed', () => {
    const [event] = deriveActivityEvents([
      entry({ status: 'completed', hasReview: false, id: 'm-42' }),
    ]);
    expect(event.message).toBe('미션이 완료됐어요 — 리뷰를 남겨주세요');
    expect(event.route).toEqual({ pathname: '/complete', params: { missionId: 'm-42' } });
  });

  it('produces no event once a completed mission has been reviewed', () => {
    const events = deriveActivityEvents([entry({ status: 'completed', hasReview: true })]);
    expect(events).toHaveLength(0);
  });

  it('produces no event for a still-open request', () => {
    const events = deriveActivityEvents([entry({ status: 'requested' })]);
    expect(events).toHaveLength(0);
  });

  it('produces no event for a cancelled mission', () => {
    const events = deriveActivityEvents([entry({ status: 'cancelled' })]);
    expect(events).toHaveLength(0);
  });
});

describe('deriveActivityEvents — hero role', () => {
  it('reports a review received, with the rating', () => {
    const [event] = deriveActivityEvents([
      entry({ role: 'hero', status: 'completed', hasReview: true, reviewRating: 5 }),
    ]);
    expect(event.message).toBe('Minjun님이 ★5 리뷰를 남겼어요');
  });

  it('treats a missing rating as ★0 rather than throwing', () => {
    const [event] = deriveActivityEvents([
      entry({ role: 'hero', status: 'completed', hasReview: true, reviewRating: null }),
    ]);
    expect(event.message).toBe('Minjun님이 ★0 리뷰를 남겼어요');
  });

  it('produces no event when there is no review yet', () => {
    const events = deriveActivityEvents([
      entry({ role: 'hero', status: 'completed', hasReview: false }),
    ]);
    expect(events).toHaveLength(0);
  });

  it('a hero never gets a leave-a-review prompt — that only applies to the user who requested it', () => {
    const events = deriveActivityEvents([
      entry({ role: 'hero', status: 'completed', hasReview: false }),
    ]);
    expect(events).toHaveLength(0);
  });
});

describe('deriveActivityEvents — ordering', () => {
  it('sorts newest first by timestamp, mixing roles and missions', () => {
    const events = deriveActivityEvents([
      entry({ id: 'old', status: 'accepted', updatedAt: '2026-01-01T00:00:00.000Z' }),
      entry({ id: 'new', status: 'arrived', updatedAt: '2026-01-03T00:00:00.000Z' }),
      entry({ id: 'mid', status: 'on_the_way', updatedAt: '2026-01-02T00:00:00.000Z' }),
    ]);
    expect(events.map((e) => e.id)).toEqual(['new', 'mid', 'old']);
  });

  it('returns an empty array for an empty mission list', () => {
    expect(deriveActivityEvents([])).toEqual([]);
  });
});
