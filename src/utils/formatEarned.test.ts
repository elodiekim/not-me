import { formatEarned } from './formatEarned';

describe('formatEarned', () => {
  it('drops a trailing .00 for whole-dollar amounts', () => {
    expect(formatEarned(20)).toBe('$20');
    expect(formatEarned(0)).toBe('$0');
  });

  it('keeps 2 decimal places for non-whole amounts', () => {
    expect(formatEarned(20.5)).toBe('$20.50');
    expect(formatEarned(10.99)).toBe('$10.99');
  });

  it('rounds to 2 places rather than leaving float drift', () => {
    // 10.1 + 10.2 === 20.299999999999997 as a raw float
    expect(formatEarned(10.1 + 10.2)).toBe('$20.30');
  });

  it('rounds a longer decimal to 2 places', () => {
    expect(formatEarned(10.005)).toBe('$10.01');
  });
});
