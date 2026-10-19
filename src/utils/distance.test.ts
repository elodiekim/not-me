import { formatDistance, haversineDistanceKm } from './distance';

describe('haversineDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    const point = { latitude: 37.5665, longitude: 126.978 };
    expect(haversineDistanceKm(point, point)).toBe(0);
  });

  it('matches a known real-world distance (Seoul to Busan, ~325km)', () => {
    const seoul = { latitude: 37.5665, longitude: 126.978 };
    const busan = { latitude: 35.1796, longitude: 129.0756 };
    const distance = haversineDistanceKm(seoul, busan);
    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(340);
  });

  it('is symmetric regardless of argument order', () => {
    const a = { latitude: 37.5665, longitude: 126.978 };
    const b = { latitude: 37.5, longitude: 127.0 };
    expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 10);
  });
});

describe('formatDistance', () => {
  it('formats sub-kilometer distances in meters, rounded', () => {
    expect(formatDistance(0.8)).toBe('800m');
    expect(formatDistance(0.1234)).toBe('123m');
  });

  it('formats 1km and above in km with 1 decimal place', () => {
    expect(formatDistance(1)).toBe('1.0km');
    expect(formatDistance(5.678)).toBe('5.7km');
  });

  it('treats exactly 1km as the km boundary, not meters', () => {
    expect(formatDistance(0.999)).toBe('999m');
    expect(formatDistance(1.0)).toBe('1.0km');
  });
});
