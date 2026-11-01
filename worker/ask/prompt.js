// The bytes of RAG Goobie's two DeepSeek requests around the build's fragments (/ask/*.txt), already JSON-escaped,
// so body.js only joins them: the answer call's system message is the rules, the pack, the catalog and any docs after
// it, in that order, most stable first for DeepSeek's prefix cache; the question is the user message, last. No
// user_id, ever (it splits the cache). PROMPT_V moves with every word and setting, and keys the answer cache.
import { fragment } from '../../src/lib/ask/blocks.js';
import { PLANNER, rules, USER } from '../../src/lib/ask/words.js';
import { sha256 } from '../lib/text.js';
import { PARAMS } from './context.js';
import { MODEL } from './deepseek.js';

export const SEP = fragment('\n\n');
export const OPEN = fragment('<documents>\n');
export const CLOSE = fragment('\n</documents>');

const { answer: a, planner: p } = PARAMS;
export const answerHead = (variant) => `{"model":"${MODEL}","stream":true,"stream_options":{"include_usage":true},`
  + `"max_tokens":${a.max_tokens},"temperature":${a.temperature},"thinking":{"type":"disabled"},`
  + `"messages":[{"role":"system","content":"${fragment(rules(variant))}${SEP}`;
export const plannerHead = `{"model":"${MODEL}","stream":false,"max_tokens":${p.max_tokens},"temperature":${p.temperature},`
  + `"thinking":{"type":"disabled"},"response_format":{"type":"json_object"},`
  + `"messages":[{"role":"system","content":"${fragment(PLANNER)}${SEP}`;
// After the system message's last fragment: the user message.
export const tail = (user) => `"},{"role":"user","content":${JSON.stringify(user)}}]}`;
export const plannerUser = (q) => `Question: ${q}`;

const versions = new Map();
export function promptV(variant) {
  if (!versions.has(variant)) versions.set(variant, sha256(rules(variant) + PLANNER + JSON.stringify(USER) + JSON.stringify(PARAMS)));
  return versions.get(variant);
}
