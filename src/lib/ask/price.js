// DeepSeek's deepseek-flash prices (api-docs.deepseek.com/quick_start/pricing, read 2026-11-01), in dollars per 1M
// tokens, and what a call costs in integer micro-dollars, rounded up. Peak is Monday-Friday 01:00-04:00 and 06:00-10:00
// UTC at the call's start; Chinese public holidays (billed off-peak) count as peak, so a cost is only ever overstated.
// The Worker's dollar cap, the build's reservation and scripts/eval's ledger all read this file.
export const PRICES = { peak: { hit: 0.006, miss: 0.30, out: 1.20 }, off: { hit: 0.003, miss: 0.15, out: 0.60 } };

export function peak(t) {
  const d = new Date(t);
  const day = d.getUTCDay();
  const h = d.getUTCHours();
  return day >= 1 && day <= 5 && ((h >= 1 && h < 4) || (h >= 6 && h < 10));
}

// usage as DeepSeek reports it: completion_tokens already counts any reasoning.
export function cost(usage, t) {
  const p = PRICES[peak(t) ? 'peak' : 'off'];
  const hit = usage.prompt_cache_hit_tokens ?? 0;
  const miss = usage.prompt_cache_miss_tokens ?? (usage.prompt_tokens ?? 0) - hit;
  return Math.ceil(hit * p.hit + miss * p.miss + (usage.completion_tokens ?? 0) * p.out);
}

// The most a call can cost: every prompt token missed, every output token used, at peak.
export const worst = (prompt, out) => Math.ceil(prompt * PRICES.peak.miss + out * PRICES.peak.out);
