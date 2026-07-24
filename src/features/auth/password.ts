// Matches Supabase Auth's server-side minimum (verified via REST: 6+ passes, 5 fails
// with weak_password). Keep in sync with the project's Auth password policy — a client
// rule looser than the server is pointless, stricter would confuse users.
export const MIN_PASSWORD_LENGTH = 6;

export const PASSWORD_TOO_SHORT_ERROR = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.\n비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`;
