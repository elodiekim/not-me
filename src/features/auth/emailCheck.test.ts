// looksLikeEmail is pure, but the module also exports isEmailRegistered,
// which imports services/supabase — that module throws at import time if
// env vars aren't present (see services/supabase.ts), so it's mocked out
// here rather than relying on real env vars being loaded under Jest.
jest.mock('../../services/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

// eslint-disable-next-line import/first -- jest.mock above must run before this import
import { looksLikeEmail } from './emailCheck';

describe('looksLikeEmail', () => {
  it('accepts a normal-looking email', () => {
    expect(looksLikeEmail('a@example.com')).toBe(true);
  });

  it('trims surrounding whitespace before checking', () => {
    expect(looksLikeEmail('  a@example.com  ')).toBe(true);
  });

  it('rejects strings with no @', () => {
    expect(looksLikeEmail('example.com')).toBe(false);
  });

  it('rejects strings with no domain', () => {
    expect(looksLikeEmail('a@')).toBe(false);
  });

  it('rejects strings with no TLD', () => {
    expect(looksLikeEmail('a@example')).toBe(false);
  });

  it('rejects an email containing a space', () => {
    expect(looksLikeEmail('a b@example.com')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(looksLikeEmail('')).toBe(false);
  });
});
