// A run's judged.json (judge.mjs): one entry a question, { qid, answer, passes: [{ must, wrong, voice_ok, handled,
// score, why }] }, and merged(), the view the gates read: the passes averaged (each must item, the score), voice_ok and
// handled true only when every pass says so, wrong the union. An entry written before --passes is one pass.
import fs from 'node:fs';
import path from 'node:path';

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const passesOf = (j) => j.passes ?? [j];

export function merged(j) {
  const ps = passesOf(j);
  const all = (k) => (ps.every((p) => p[k] === null || p[k] === undefined) ? null : ps.every((p) => p[k] === true));
  return { qid: j.qid, answer: j.answer, passes: ps, must: (ps[0].must ?? [0]).map((_, i) => mean(ps.map((p) => p.must?.[i] ?? 0))),
    score: mean(ps.map((p) => p.score ?? 0)), voice_ok: all('voice_ok'), handled: all('handled'),
    wrong: [...new Set(ps.flatMap((p) => p.wrong ?? []))], why: ps.map((p) => p.why).join(' / ') };
}

export function judgedOf(dir) {
  const f = path.join(dir, 'judged.json');
  return new Map(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')).map((j) => [j.qid, j]) : []);
}
export const writeJudged = (dir, map) => fs.writeFileSync(path.join(dir, 'judged.json'), JSON.stringify([...map.values()], null, 1));
