#!/usr/bin/env node
// Populates the Supabase project with realistic-looking mission/review/user data so
// the admin dashboard's aggregate screens (mission list, user list, stats) have
// something to show. All writes go through the real REST API with real accounts, so
// this doubles as a smoke test of RLS/trigger behavior (self-accept prevention,
// cancel rules, review rating recalculation, etc.) — a create/mutate failure here
// usually means a real regression, not just "no data yet."
//
// Run: npm run qa:seed
// Configure: QA_USERS=20 QA_MISSIONS=40 npm run qa:seed (both default as shown)
//
// Safe to run repeatedly — qa-seed-NN@example.com accounts are reused (signed in,
// not recreated) on every run; only new missions are added each time. Signup dates
// are only backdated the first time an account is created, so the signup trend
// stays stable across runs.
//
// This writes to whatever Supabase project notme-app/.env points at. There is no
// DELETE RLS policy on missions/reviews (see TODO.md), so cleanup is manual — the
// SQL is printed at the end of every run.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = {};
  const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf('=');
    if (!trimmed || trimmed.startsWith('#') || eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.EXPO_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !ANON_KEY) {
  console.error('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const NUM_USERS = Number(process.env.QA_USERS ?? 20);
const NUM_MISSIONS = Number(process.env.QA_MISSIONS ?? 40);
const PASSWORD = 'qaseed12345';
const TODAY = new Date().toISOString().slice(0, 10);

async function api(method, path, { token, body } = {}) {
  const headers = { apikey: ANON_KEY, 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const signIn = (email) =>
  api('POST', '/auth/v1/token?grant_type=password', { body: { email, password: PASSWORD } });

async function ensureUser(index) {
  const label = String(index).padStart(2, '0');
  const email = `qa-seed-${label}@example.com`;

  const existing = await signIn(email);
  if (existing.status === 200) {
    return { id: existing.data.user.id, token: existing.data.access_token, email, isNew: false };
  }

  const signup = await api('POST', '/auth/v1/signup', {
    body: {
      email,
      password: PASSWORD,
      data: { name: `QA Seed ${label}`, phone: `0100000${label.padStart(4, '0')}` },
    },
  });
  if (signup.status !== 200 || !signup.data?.user?.id) {
    throw new Error(`sign-up failed for ${email}: ${signup.status} ${JSON.stringify(signup.data)}`);
  }
  const token = signup.data.access_token ?? (await signIn(email)).data?.access_token;
  if (!token) {
    throw new Error(`no session for ${email} — is Confirm email switched on?`);
  }
  return { id: signup.data.user.id, token, email, isNew: true };
}

async function backdateSignup(user, index) {
  const daysAgo = Math.floor(((index - 1) * 30) / NUM_USERS) + Math.floor(Math.random() * 2);
  const hoursAgo = Math.floor(Math.random() * 24);
  const fakeCreatedAt = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
  await api('PATCH', `/rest/v1/profiles?id=eq.${user.id}`, {
    token: user.token,
    body: { created_at: fakeCreatedAt },
  });
}

function shuffledPlan(total) {
  const ratios = [
    ['requested', 0.125],
    ['accepted', 0.1],
    ['on_the_way', 0.1],
    ['arrived', 0.1],
    ['completed', 0.375],
    ['cancelled_from_requested', 0.075],
    ['cancelled_from_accepted', 0.075],
    ['hero_back_out', 0.05],
  ];
  const plan = [];
  for (const [kind, ratio] of ratios) {
    for (let i = 0; i < Math.round(total * ratio); i++) plan.push(kind);
  }
  while (plan.length < total) plan.push('completed');
  plan.length = total;
  for (let i = plan.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [plan[i], plan[j]] = [plan[j], plan[i]];
  }
  return plan;
}

const heroFor = (users, idx) => users[(idx + 7) % users.length];

function weightedRating() {
  const r = Math.random() * 100;
  if (r < 45) return 5;
  if (r < 70) return 4;
  if (r < 85) return 3;
  if (r < 95) return 2;
  return 1;
}

const REWARDS = [10, 15, 20, 25, 30, 40, 50];
const COMMENTS = [
  'Fast and friendly!',
  '정말 빠르게 해결해주셨어요.',
  null,
  'Good job, would call again.',
  '조금 늦었지만 만족해요.',
  null,
];

async function seedMissions(users, plan) {
  const results = {
    requested: 0,
    accepted: 0,
    on_the_way: 0,
    arrived: 0,
    completed: 0,
    cancelled: 0,
    backed_out: 0,
    errors: [],
  };

  for (let n = 0; n < plan.length; n++) {
    const kind = plan[n];
    const requester = users[n % users.length];
    const hero = heroFor(users, n % users.length);
    const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
    const address = `QA Seed Mission #${String(n + 1).padStart(2, '0')} (${kind}) ${TODAY}`;

    const create = await api('POST', '/rest/v1/missions', {
      token: requester.token,
      body: { requester_id: requester.id, category: 'cockroach', reward_amount: reward, address },
    });
    if (![200, 201].includes(create.status)) {
      results.errors.push(`#${n + 1} create failed: ${create.status} ${JSON.stringify(create.data)}`);
      continue;
    }
    let missionId = Array.isArray(create.data) ? create.data[0]?.id : undefined;
    if (!missionId) {
      const lookup = await api(
        'GET',
        `/rest/v1/missions?requester_id=eq.${requester.id}&address=eq.${encodeURIComponent(address)}&select=id&order=created_at.desc&limit=1`,
        { token: requester.token },
      );
      missionId = lookup.data?.[0]?.id;
    }
    if (!missionId) {
      results.errors.push(`#${n + 1}: could not resolve mission id after create`);
      continue;
    }

    const patch = (token, body, query = '') =>
      api('PATCH', `/rest/v1/missions?id=eq.${missionId}${query}`, { token, body });

    if (kind === 'requested') {
      results.requested++;
      continue;
    }

    if (kind === 'cancelled_from_requested') {
      const r = await patch(requester.token, { status: 'cancelled' }, '&status=eq.requested');
      if ([200, 204].includes(r.status)) results.cancelled++;
      else results.errors.push(`#${n + 1} cancel-from-requested failed: ${r.status} ${JSON.stringify(r.data)}`);
      continue;
    }

    const accept = await patch(hero.token, { hero_id: hero.id, status: 'accepted' }, '&status=eq.requested');
    if (![200, 204].includes(accept.status)) {
      results.errors.push(`#${n + 1} accept failed: ${accept.status} ${JSON.stringify(accept.data)}`);
      continue;
    }
    if (kind === 'accepted') {
      results.accepted++;
      continue;
    }

    if (kind === 'cancelled_from_accepted') {
      const r = await patch(requester.token, { status: 'cancelled' });
      if ([200, 204].includes(r.status)) results.cancelled++;
      else results.errors.push(`#${n + 1} cancel-from-accepted failed: ${r.status} ${JSON.stringify(r.data)}`);
      continue;
    }

    if (kind === 'hero_back_out') {
      const r = await patch(hero.token, { status: 'requested', hero_id: null });
      if ([200, 204].includes(r.status)) results.backed_out++;
      else results.errors.push(`#${n + 1} back-out failed: ${r.status} ${JSON.stringify(r.data)}`);
      continue;
    }

    const otw = await patch(hero.token, { status: 'on_the_way' }, '&status=eq.accepted');
    if (![200, 204].includes(otw.status)) {
      results.errors.push(`#${n + 1} on_the_way failed: ${otw.status} ${JSON.stringify(otw.data)}`);
      continue;
    }
    if (kind === 'on_the_way') {
      results.on_the_way++;
      continue;
    }

    const arrived = await patch(hero.token, { status: 'arrived' }, '&status=eq.on_the_way');
    if (![200, 204].includes(arrived.status)) {
      results.errors.push(`#${n + 1} arrived failed: ${arrived.status} ${JSON.stringify(arrived.data)}`);
      continue;
    }
    if (kind === 'arrived') {
      results.arrived++;
      continue;
    }

    const completed = await patch(hero.token, { status: 'completed' }, '&status=eq.arrived');
    if (![200, 204].includes(completed.status)) {
      results.errors.push(`#${n + 1} completed failed: ${completed.status} ${JSON.stringify(completed.data)}`);
      continue;
    }

    const rating = weightedRating();
    const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
    const reviewBody = { mission_id: missionId, reviewer_id: requester.id, hero_id: hero.id, rating };
    if (comment) reviewBody.comment = comment;
    const review = await api('POST', '/rest/v1/reviews', { token: requester.token, body: reviewBody });
    if (![200, 201].includes(review.status)) {
      results.errors.push(`#${n + 1} review failed: ${review.status} ${JSON.stringify(review.data)}`);
    }
    results.completed++;
  }

  return results;
}

async function main() {
  console.log(`QA seed: 유저 ${NUM_USERS}명 / 미션 ${NUM_MISSIONS}개`);
  const users = [];
  let newUsers = 0;
  for (let i = 1; i <= NUM_USERS; i++) {
    const user = await ensureUser(i);
    if (user.isNew) {
      await backdateSignup(user, i);
      newUsers++;
    }
    users.push(user);
  }
  console.log(`유저 준비 완료 (신규 ${newUsers}명 · 기존 ${NUM_USERS - newUsers}명 재사용)`);

  const plan = shuffledPlan(NUM_MISSIONS);
  const results = await seedMissions(users, plan);

  console.log('=== 결과 ===');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n정리하려면 Supabase SQL Editor에서 (DELETE RLS가 없어 REST로는 못 지움):');
  console.log("  delete from missions where address like 'QA Seed Mission%';");
  console.log('테스트 계정 자체를 지우려면: Authentication → Users에서 "qa-seed-" 검색 후 수동 삭제');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
