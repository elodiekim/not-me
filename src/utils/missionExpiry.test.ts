import {
  elapsedMinutes,
  isMissionStalled,
  isRequestStale,
  millisUntilStale,
} from './missionExpiry';

// SEARCH_TIMEOUT_MS = 15min, STALLED_MISSION_MS = 30min (src/constants/mission.ts).
const NOW = new Date('2026-01-01T12:00:00.000Z').getTime();

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(NOW);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('millisUntilStale', () => {
  it('returns the full timeout for a mission created right now', () => {
    expect(millisUntilStale(new Date(NOW).toISOString())).toBe(15 * 60 * 1000);
  });

  it('returns a smaller positive number as time passes', () => {
    const createdAt = new Date(NOW - 5 * 60 * 1000).toISOString(); // 5 min ago
    expect(millisUntilStale(createdAt)).toBe(10 * 60 * 1000);
  });

  it('goes negative once past the timeout', () => {
    const createdAt = new Date(NOW - 20 * 60 * 1000).toISOString(); // 20 min ago
    expect(millisUntilStale(createdAt)).toBe(-5 * 60 * 1000);
  });
});

describe('isRequestStale', () => {
  it('is false right up to the timeout', () => {
    const createdAt = new Date(NOW - 14 * 60 * 1000).toISOString();
    expect(isRequestStale(createdAt)).toBe(false);
  });

  it('is true exactly at the timeout', () => {
    const createdAt = new Date(NOW - 15 * 60 * 1000).toISOString();
    expect(isRequestStale(createdAt)).toBe(true);
  });

  it('is true well past the timeout', () => {
    const createdAt = new Date(NOW - 60 * 60 * 1000).toISOString();
    expect(isRequestStale(createdAt)).toBe(true);
  });
});

describe('isMissionStalled', () => {
  it('is false before 30 minutes of no progress', () => {
    const updatedAt = new Date(NOW - 29 * 60 * 1000).toISOString();
    expect(isMissionStalled(updatedAt)).toBe(false);
  });

  it('is true at exactly 30 minutes', () => {
    const updatedAt = new Date(NOW - 30 * 60 * 1000).toISOString();
    expect(isMissionStalled(updatedAt)).toBe(true);
  });
});

describe('elapsedMinutes', () => {
  it('rounds down to whole minutes', () => {
    const createdAt = new Date(NOW - 90 * 1000).toISOString(); // 1.5 min ago
    expect(elapsedMinutes(createdAt)).toBe(1);
  });

  it('returns 0 for a mission created just now', () => {
    expect(elapsedMinutes(new Date(NOW).toISOString())).toBe(0);
  });

  it('returns a larger whole number after longer waits', () => {
    const createdAt = new Date(NOW - 12 * 60 * 1000).toISOString();
    expect(elapsedMinutes(createdAt)).toBe(12);
  });
});
