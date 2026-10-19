import { parseLang } from './lang';

describe('parseLang', () => {
  it('returns kr for the literal "kr"', () => {
    expect(parseLang('kr')).toBe('kr');
  });

  it('defaults to en for anything else', () => {
    expect(parseLang('en')).toBe('en');
    expect(parseLang('fr')).toBe('en');
    expect(parseLang(undefined)).toBe('en');
  });

  it('defaults to en for an array param (expo-router repeated query key)', () => {
    expect(parseLang(['kr', 'en'])).toBe('en');
    expect(parseLang(['kr'])).toBe('en');
  });
});
