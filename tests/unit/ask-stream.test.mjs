// The browser's reader of RAG Goobie's stream (src/scripts/search/ask-stream.js): the same events whatever the chunk
// boundaries, a frame or a UTF-8 character split across reads; and 40 s of silence ends it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { events } from '../../src/scripts/search/ask-stream.js';

const EVENTS = [{ t: 'start', posts: 71 }, { t: 'text', d: 'Aaron’s café — naïve 日本 [1].' }, { t: 'answer', answer: 'é' }];
const bytes = new TextEncoder().encode(EVENTS.map((e) => `data: ${JSON.stringify(e)}\n\n`).join(''));
const body = (cuts) => new ReadableStream({
  start(c) {
    let at = 0;
    for (const to of [...cuts, bytes.length]) { c.enqueue(bytes.slice(at, to)); at = to; }
    c.close();
  },
});
const all = async (b, idle) => { const out = []; for await (const e of events(b, idle)) out.push(e); return out; };

test('any chunking gives the same events, mid-line and mid-character alike', async () => {
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let run = 0; run < 200; run++) {
    const cuts = [...new Set(Array.from({ length: 1 + Math.floor(rnd() * 12) }, () => Math.floor(rnd() * bytes.length)))].sort((a, b) => a - b);
    assert.deepEqual(await all(body(cuts)), EVENTS);
  }
  assert.deepEqual(await all(body(Array.from({ length: bytes.length - 1 }, (_, i) => i + 1))), EVENTS, 'one byte at a time');
});

test('a stream that goes quiet for the give-up time ends with an error', async () => {
  const quiet = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {"t":"start"}\n\n')); } });
  await assert.rejects(all(quiet, 50), /no event/);
});
