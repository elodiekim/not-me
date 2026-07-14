-- RewardScreen only checked Number.isFinite(parsed) && parsed > 0 client-side, so
-- unrealistic values like $999999999 (or a direct REST insert bypassing the client
-- entirely) passed straight into missions.reward_amount, which had no upper bound.
-- Client-side guard added in RewardScreen.tsx (MAX_REWARD_AMOUNT); this constraint
-- is the actual enforcement point in case that guard is bypassed.
alter table public.missions
  add constraint reward_amount_range check (reward_amount > 0 and reward_amount <= 200);
