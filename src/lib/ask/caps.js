// RAG Goobie's caps, in est. tokens: est(chars) = chars / 3.5, about 7% over DeepSeek's count on this blog (3.76), so
// every cap sits on the safe side. The build (src/lib/ask/), the Worker (worker/ask/) and scripts/eval/ read this one
// file; docs/ASK.md says why each number is what it is. Lowering WHOLE_CAP moves the switch to split mode, nothing else.
export const BUDGET = 700_000;       // the answer call's whole input: rules, documents, catalog, question (70% of 1M)
export const WHOLE_CAP = 600_000;    // whole mode while every non-live doc fits under this, in one pack
export const PACK_CAP = 375_000;     // split mode: a pack, so 6 focus docs at their caps always fit beside it
export const DOC_CAP = 36_000;       // a post with its notes page; past it the bottom sections stay on its page
export const LIVE_CAP = 60_000;      // every live notebook together; past it the middle stays on its page
export const CATALOG_CAP = 80_000;   // one line a post; past it the oldest lines drop their takeaway
export const WHOLE_CATALOG = 10_000; // the catalog's share in whole mode (about 160 posts' lines)
export const RULES_TOKENS = 1_000;   // the rules, as the budget sums count them
export const USER_TOKENS = 500;      // the counts, the hint and a 300-character question
export const SLACK = 2_000;          // separators and the request's own bytes
export const EXTRA_TOKENS = 80_000;  // split mode's uncached docs per question (the flag ask_extra_tokens)
export const RE_GATE = 450_000;      // a pack this big re-runs G2: answer quality is measured only up to ~304k
export const est = (chars) => Math.ceil(chars / 3.5);

// The budget sums the build checks (scripts/build/ask-dist.mjs): on the caps, never the content, so no post fails them.
export const sums = (c = { WHOLE_CAP, PACK_CAP, DOC_CAP, LIVE_CAP, CATALOG_CAP }) => ({
  whole: c.WHOLE_CAP + RULES_TOKENS + WHOLE_CATALOG + c.LIVE_CAP + SLACK,
  room: BUDGET - RULES_TOKENS - c.CATALOG_CAP - USER_TOKENS - c.PACK_CAP - SLACK,
  focus: c.LIVE_CAP + 5 * c.DOC_CAP,
});
