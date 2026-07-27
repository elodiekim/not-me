// Sum of a few decimals can drift (10.1 + 10.2 = 20.2999…), so pin to 2 places
// first, then drop a trailing .00 so whole-dollar totals read as "$20".
export function formatEarned(amount: number) {
  const fixed = amount.toFixed(2);
  return `$${fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed}`;
}
