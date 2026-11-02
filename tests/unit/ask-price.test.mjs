// RAG Goobie's prices (src/lib/ask/price.js): the peak windows at their edges and on weekends, a call's cost from the
// usage DeepSeek reports (rounded up, reasoning not counted twice), the worst case, and the build's reservation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cost, peak, worst } from '../../src/lib/ask/price.js';
import { RULES_TOKENS } from '../../src/lib/ask/caps.js';
import { built } from './ask-fixture.mjs';

const at = (hm, day = '2026-11-02') => Date.parse(`${day}T${hm}:00Z`);   // 2 November 2026 is a Monday

test('peak is Monday to Friday, 01:00-04:00 and 06:00-10:00 UTC, by the start time', () => {
  const edges = { '00:59': false, '01:00': true, '03:59': true, '04:00': false, '05:59': false, '06:00': true, '09:59': true, '10:00': false };
  for (const [hm, want] of Object.entries(edges)) assert.equal(peak(at(hm)), want, hm);
  assert.equal(peak(at('07:00', '2026-11-06')), true, 'Friday');
  assert.equal(peak(at('07:00', '2026-11-07')), false, 'Saturday');
  assert.equal(peak(at('02:00', '2026-11-01')), false, 'Sunday');
});

test('a call costs its hit, miss and output tokens at that time\'s prices, in micro-dollars rounded up', () => {
  const usage = { prompt_tokens: 309000, prompt_cache_hit_tokens: 308400, prompt_cache_miss_tokens: 600, completion_tokens: 230,
    completion_tokens_details: { reasoning_tokens: 100 } };
  assert.equal(cost(usage, at('07:00')), Math.ceil(308400 * 0.006 + 600 * 0.3 + 230 * 1.2));
  assert.equal(cost(usage, at('12:00')), Math.ceil(308400 * 0.003 + 600 * 0.15 + 230 * 0.6));
  assert.equal(cost({ prompt_tokens: 1000, prompt_cache_hit_tokens: 400, completion_tokens: 0 }, at('12:00')), 92, 'miss from the total');
  assert.equal(worst(1000, 100), 420);
});

test('the reservation is the planner\'s and the largest answer prompt\'s worst cases, all missed at peak', () => {
  const { manifest: m } = built();
  const answer = RULES_TOKENS + m.packs[0].tokens + m.docs[7].tokens + m.overview.tokens + 500;
  assert.deepEqual(m.reserve, { plan: worst(m.catalog.tokens + 500, 300), answer: worst(answer, 600) });
  assert.equal(m.reserve_usd, (m.reserve.plan + m.reserve.answer) / 1e6);
  assert.ok(cost({ prompt_tokens: answer, completion_tokens: 600 }, at('07:00')) <= m.reserve.answer);
});
