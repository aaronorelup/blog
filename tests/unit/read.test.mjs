// Read-aloud: the spoken copy and its map back to the screen (src/lib/read/speak.js), word alignment (align.js),
// section hashes on a real archived post (sections.js), and the cron (worker/read/step.js) on an in-memory D1, a fake
// bucket and a fake ElevenLabs: every section then the post file, the floor, a failed subscription call, a null
// alignment, three tries.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import { rehypePlugins } from '../../scripts/build/markdown.mjs';
import { alignWords } from '../../src/lib/read/align.js';
import { postHash, sectionsOf } from '../../src/lib/read/sections.js';
import { say, spoken, toDisplay } from '../../src/lib/read/speak.js';
import { d1, loadWorker } from './worker-env.mjs';

const CASES = {
  'It costs $0.28-an-hour.': 'It costs twenty-eight cents an-hour.',
  'took 15.8 s': 'took fifteen point eight seconds',
  'a 1080p video': 'a ten eighty p video',
  'see AO-045': 'see A O forty-five',
  'an 8 GB card': 'an eight gigabytes card',
  'all 1,308 words': 'all one thousand three hundred eight words',
  'on 2026-10-31.': 'on October thirty-first, twenty twenty-six.',
  'about 4-5x faster': 'about four to five times faster',
};

// Times as the posts write them (a grep of src/content on 2026-11-01; the post after each), read the way a person says
// them: a clock, a length or a place in a recording, told apart by a date or a zone beside it, else by its own shape.
const TIMES = Object.fromEntries([
  ['30:00.000 of programme and 20.000 s of black', 'thirty minutes of programme and twenty seconds of black'], // touch-move notes
  ["At 20:00.000 the teacher's flag falls", "At twenty minutes the teacher's flag falls"], // touch-move notes
  ['reaches 100% at 19:59.9.', 'reaches one hundred percent at nineteen minutes and fifty-nine point nine seconds.'], // context-window notes
  ['The film is still exactly 30:20, every', 'The film is still exactly thirty minutes and twenty seconds, every'], // context-window notes
  ["It didn't even explode. 3:46:06", "It didn't even explode. three hours, forty-six minutes and six seconds"], // arcmira-mcp-test
  ['a 1:02:03 clip', 'a one hour, two minutes and three seconds clip'],
  ['00:00 Cold open · 00:35 The palette', 'zero seconds Cold open · thirty-five seconds The palette'], // crimson-coil notes
  ['HyperFrames 0:12.9 · the tide', 'HyperFrames twelve point nine seconds · the tide'], // moonlight-in-code
  ['2:44.8 long', 'two minutes and forty-four point eight seconds long'], // still-on-shift-music-video
  ['a 2:45 music video', 'a two forty-five music video'], // still-on-shift-music-video
  ['Clay previs at 1:46: a clay diver', 'Clay previs at one forty-six: a clay diver'], // moonlight-two-cuts
  ['At 9:30 the lights go out.', 'At nine thirty the lights go out.'],
  ['At 14:14 I typed:', 'At fourteen fourteen I typed:'], // showreel-rebuilt
  ['At 03:31 the picture pulls back.', 'At three thirty-one the picture pulls back.'], // earthlight notes
  ['at 01:08 on the 23rd', 'at one oh eight on the twenty-third'], // touch-move notes
  ['a 10:00 call', "a ten o'clock call"],
  ['from 19:00 to midnight UTC', 'from nineteen hundred to midnight UTC'], // d1-free-tier-cutoff
  ['At 20:00 its context window, everything', 'At twenty minutes its context window, everything'], // context-window
  ['Until 19:00 about 80% showed the same', 'Until nineteen minutes about eighty percent showed the same'], // touch-move
  ['The build took 8h39m overnight.', 'The build took eight hours and thirty-nine minutes overnight.'], // armies-of-gielinor-gauntlet
  ['at about 21:00 UTC on 21 October', 'at about twenty-one hundred UTC on the twenty-first of October'], // d1-free-tier-cutoff
  ['7 Oct 00:06 I ask', 'the seventh of October twelve oh six I ask'], // every-video-can-seek
  ['Scan of 20 Oct 2026, 23:36 to 00:10.', // counting-the-code
    'Scan of the twentieth of October twenty twenty-six, twenty-three thirty-six to twelve ten.'],
  ['back at 00:47:58', 'back at twelve forty-seven and fifty-eight seconds'], // the-branch-that-went-live
  ['Sources 05:37:28 05:39:01', 'Sources five thirty-seven and twenty-eight seconds five thirty-nine and one second'], // first-lesson-on-the-new-map
  ['its verify at 13:09, 13 h 22 min in', 'its verify at thirteen oh nine, thirteen hours twenty-two minutes in'], // touch-move notes
  ['hold up at 8:1', 'hold up at eight to one'], // moss-image-on-8gb
  ['the wide 2.39:1 cinema frame', 'the wide two point three nine to one cinema frame'], // moonlight-two-cuts
]);

test('numbers, money, units, ids, dates and ranges are spelled out; the rest is read as written', () => {
  for (const [display, want] of Object.entries(CASES)) assert.equal(say(display).text, want);
  for (const s of ['v4.1 and H3', 'GPT-4o in 3D', 'version 1.2.3']) assert.equal(say(s).text, s);
});

test('clock times, lengths and places in a recording are said as a person says them', () => {
  for (const [display, want] of Object.entries(TIMES)) assert.equal(say(display).text, want, display);
});

test('every spoken character maps back to the display character it was copied from, or into the run it spells out', () => {
  for (const display of [...Object.keys(CASES), ...Object.keys(TIMES)]) {
    const { text, map } = spoken([['t', 'h', display]]);
    const runs = say(display).map; // [spokenStart, spokenLength, displayStart, displayLength]
    for (let k = 0; k < text.length; k++) {
      const run = runs.find(([s0, sl]) => k >= s0 && k < s0 + sl);
      if (!run) { assert.equal(toDisplay(map, k), null, 'the full stop a heading gets'); continue; }
      const [j, d] = toDisplay(map, k);
      const [s0, , d0, dl] = run;
      assert.equal(j, 0);
      if (text.slice(s0, s0 + run[1]) === display.slice(d0, d0 + dl)) assert.equal(d, d0 + k - s0, `${display} @${k}`);
      else assert.ok(d >= d0 && d < d0 + dl && /\d/.test(display.slice(d0, d0 + dl)), `${display} @${k} -> ${d}`);
    }
  }
});

test('alignment: each display word gets its spoken characters\' times; a missing or foreign alignment is null', () => {
  const blocks = [['t', 'h', 'Rent one'], [0, 'p', 'It costs $0.28-an-hour, says AO-045.']];
  const said = spoken(blocks);
  const chars = [...said.text];
  const at = (k) => k / 10;
  const alignment = { characters: chars, character_start_times_seconds: chars.map((_, k) => at(k)),
                      character_end_times_seconds: chars.map((_, k) => at(k + 1)) };
  const words = alignWords(blocks, said, alignment);
  assert.deepEqual(words.map(([j, c0, c1]) => blocks[j][2].slice(c0, c1)),
    ['Rent', 'one', 'It', 'costs', '$0.28-an-hour,', 'says', 'AO-045.']);
  for (let i = 1; i < words.length; i++) assert.ok(words[i][3] >= words[i - 1][4] - 1, 'in order');
  const price = words[4];
  assert.equal(price[3], said.text.indexOf('twenty') * 100);
  assert.equal(alignWords(blocks, said, null), null);
  assert.equal(alignWords(blocks, said, { ...alignment, characters: chars.slice(1) }), null);
});

// A real post with h2 sections, through Astro's Markdown processor and the build's plugins.
const ROOT = new URL('../../', import.meta.url);
const file = new URL('archive/2026-10-29-before-rework/posts/touch-move.md', ROOT);
const { data, content } = matter(fs.readFileSync(file, 'utf8'));
const md = await createMarkdownProcessor({ rehypePlugins: rehypePlugins({ publicDir: fileURLToPath(new URL('public/', ROOT)) }), syntaxHighlight: false });
const textOf = async (body) => (await md.render(body, { fileURL: file, frontmatter: {} })).metadata.frontmatter.text;

test('two builds give the same hashes; editing one paragraph changes exactly one section', async () => {
  const text = await textOf(content);
  const a = sectionsOf(data, text);
  assert.deepEqual(sectionsOf(data, await textOf(content)), a);
  assert.ok(a.length > 5);
  assert.deepEqual(a[0].blocks.slice(0, 2).map(([r]) => r), ['t', 's']);
  for (const s of a.slice(1)) assert.ok(s.chars <= 2500 || s.blocks.length === 1);
  const h2s = text.headings.filter((h) => h.depth === 2).length;
  assert.ok(a.length >= h2s + 1, 'one section per h2 at least, after the opening');

  const para = text.read.blocks.find(([kind, s], i) => kind === 'p' && i > 20 && content.includes(s))[1];
  const b = sectionsOf(data, await textOf(content.replace(para, para + ' One more sentence.')));
  assert.equal(b.length, a.length);
  assert.equal(b.filter((s, i) => s.hash !== a[i].hash).length, 1);
  assert.notEqual(postHash(b), postHash(a));
});

test('a live notebook that failed to render still has its title and summary section', () => {
  const [only] = sectionsOf({ title: 'A  title', summary: 'A summary.' }, undefined);
  assert.deepEqual(only.blocks, [['t', 'h', 'A title'], ['s', 'p', 'A summary.']]);
});

// The cron. A Worker isolate reads its flags once every 30 s and makes its tables once, so the tests share one D1 (rows
// cleared for each) and move the clock on a minute each time.
const { step } = await loadWorker('read/step.js');
const DB = d1();
for (const schema of [await loadWorker('lib/flags.sql'), await loadWorker('read/read.sql')]) {
  for (const sql of schema.default.replace(/--.*$/gm, '').split(';').filter((q) => q.trim())) await DB.prepare(sql).run();
}
const realNow = Date.now;
let skew = 0;
Date.now = () => realNow() + skew;

const INDEX = { voice: 'v1', model: 'm1', format: 'mp3_44100_64', settings: { speed: 1 },
  posts: { second: { hash: 'p2', chars: 20, rank: 1 }, first: { hash: 'p1', chars: 40, rank: 0 } } };
const section = (hash, blocks) => ({ hash, chars: spoken(blocks).text.length, blocks });
const DOCS = {
  first: { slug: 'first', hash: 'p1', sections: [section('a1', [['t', 'h', 'First'], ['s', 'p', 'It is 8 GB.']]),
    section('a2', [[0, 'h', 'More'], [1, 'p', 'Two words.']])] },
  second: { slug: 'second', hash: 'p2', sections: [section('b1', [['t', 'h', 'Second'], ['s', 'p', 'Short.']])] },
};
const FILES = { '/read/index.json': INDEX, '/read/first.json': DOCS.first, '/read/second.json': DOCS.second };

async function world({ subscription = { character_limit: 1000, character_count: 100 }, alignment = true, flags = [] } = {}) {
  skew += 60e3;
  for (const table of ['flags', 'usage_day', 'read_state']) await DB.prepare(`DELETE FROM ${table}`).run();
  for (const [k, v] of flags) await DB.prepare('INSERT INTO flags VALUES (?1, ?2)').bind(k, v).run();
  const bucket = new Map();
  const calls = [];
  const env = {
    ELEVENLABS_API_KEY: 'test',
    DB,
    ASSETS: { fetch: async (r) => Response.json(FILES[new URL(r.url).pathname]) },
    MEDIA: {
      head: async (key) => (bucket.has(key) ? {} : null),
      get: async (key) => ({ json: async () => JSON.parse(bucket.get(key)) }),
      put: async (key, value) => { bucket.set(key, typeof value === 'string' ? value : value.length); },
    },
  };
  globalThis.fetch = async (url, init = {}) => {
    calls.push(String(url));
    assert.equal(init.headers['xi-api-key'], 'test');
    if (String(url).endsWith('/user/subscription')) {
      return subscription ? Response.json(subscription) : new Response(null, { status: 500 });
    }
    const { text, model_id: model } = JSON.parse(init.body);
    assert.equal(model, 'm1');
    const chars = [...text];
    const times = chars.map((_, k) => k / 20);
    return Response.json({ audio_base64: btoa('mp3 bytes'), alignment: alignment ? { characters: chars,
      character_start_times_seconds: times, character_end_times_seconds: times.map((t) => t + 0.05) } : null },
    { headers: { 'character-cost': String(Math.ceil(text.length / 4)) } });
  };
  const state = async (slug) => { const row = await DB.prepare('SELECT hash, state, tries FROM read_state WHERE slug = ?1').bind(slug).first(); return row && { ...row }; };
  const credits = () => DB.prepare("SELECT n FROM usage_day WHERE what = 'tts_credits'").first('n');
  return { env, bucket, calls, state, credits };
}

test('the cron voices the first post by rank, every section, then the post file; then the next post', async () => {
  const w = await world();
  assert.match(await step(w.env), /^first: 2 sections, \d+ characters, \d+ credits, recording p1 whole$/);
  const file = JSON.parse(w.bucket.get('read/first/p1.json'));
  assert.equal(file.hash, 'p1');
  assert.deepEqual(file.parts.map((p) => p.src), ['/read/first/a1.mp3', '/read/first/a2.mp3']);
  const shown = (r, c0, c1) => DOCS.first.sections.flatMap((s) => s.blocks).find(([b]) => b === r)[2].slice(c0, c1);
  assert.deepEqual(file.parts.flatMap((p) => p.words.map(([r, c0, c1]) => shown(r, c0, c1))),
    ['First', 'It', 'is', '8', 'GB.', 'More', 'Two', 'words.']);
  assert.deepEqual(await w.state('first'), { hash: 'p1', state: 'done', tries: 0 });
  assert.equal(w.calls.length, 3); // the subscription, then two sections
  const billed = DOCS.first.sections.reduce((n, s) => n + Math.ceil(spoken(s.blocks).text.length / 4), 0);
  assert.equal(await w.credits(), billed); // what the answers said, not the estimate
  assert.match(await step(w.env), /^second: 1 sections/);
  assert.equal(await step(w.env), 'idle');
});

test('the floor, a failed subscription call and the switch make nothing and count no try', async () => {
  const floor = await world({ flags: [['tts_credit_floor', '0.99']] });
  assert.match(await step(floor.env), /at the floor/);
  assert.equal(floor.bucket.size, 0);
  assert.equal(await floor.state('first'), null);

  const down = await world({ subscription: null });
  assert.equal(await step(down.env), 'stopped: the subscription call failed');
  assert.equal(await down.state('first'), null);
  assert.equal(await step({ ...down.env, ELEVENLABS_API_KEY: undefined }), 'off');
  const off = await world({ flags: [['tts', 'off']] });
  assert.equal(await step(off.env), 'off');
  assert.equal(off.calls.length, 0);
});

test('a null alignment fails the post; three failures at one hash and it is skipped', async () => {
  const w = await world({ alignment: false });
  for (let n = 1; n <= 3; n++) {
    assert.match(await step(w.env), /^first: section a1 failed \(no alignment\)/);
    assert.deepEqual(await w.state('first'), { hash: 'p1', state: 'failed', tries: n });
  }
  assert.match(await step(w.env), /^second: section b1 failed/);
  assert.equal(w.bucket.size, 0);
  assert.equal(await w.credits(), 3 * Math.ceil(spoken(DOCS.first.sections[0].blocks).text.length / 4)
    + Math.ceil(spoken(DOCS.second.sections[0].blocks).text.length / 4)); // a failed answer is still billed
});
