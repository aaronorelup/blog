// The microphone's press in the page (src/scripts/search/hear.js): a press that is still waiting on the browser's
// permission prompt records nothing once Ask is left (cancel()), and two presses under one prompt make one recording.
// The browser is faked: getUserMedia settles when the test says, MediaRecorder only counts.
import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';

const el = () => ({ attrs: {}, kids: [], setAttribute(k, v) { this.attrs[k] = v; }, append(...k) { this.kids.push(...k); } });
globalThis.document = { createElement: el };

const prompts = [];       // one per getUserMedia call: grant() settles it with a stream
const streams = [];
function stream() {
  const track = { stopped: false, stop() { track.stopped = true; } };
  const s = { track, getTracks: () => [track] };
  streams.push(s);
  return s;
}
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  mediaDevices: { getUserMedia: () => new Promise((grant) => prompts.push(() => grant(stream()))) },
} });

const recorders = [];
globalThis.MediaRecorder = class {
  static isTypeSupported = () => true;
  constructor(s, { mimeType }) { this.stream = s; this.mimeType = mimeType; this.state = 'inactive'; recorders.push(this); }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.onstop(); }
};

const { toggle, cancel } = await import('../../src/scripts/search/hear.js');

const ui = () => ({ mic: el(), micTime: {}, voiceLine: {} });
const opts = { token: async () => null, forget() {}, heard() {}, draw() {} };
// Every recording is dropped unsent, so no timer outlives a test and none starts from the last one's state.
afterEach(() => {
  cancel();
  for (const r of recorders) if (r.state !== 'inactive') r.stop();
  prompts.length = streams.length = recorders.length = 0;
});

test('a press granted after Ask was left records nothing and lets the microphone go', async () => {
  const press = toggle(ui(), opts);
  cancel();                       // the box closed while the permission prompt was up
  prompts[0]();
  await press;
  assert.equal(recorders.length, 0, 'no recording starts once the press was cancelled');
  assert.equal(streams[0].track.stopped, true, 'the microphone is released');
});

test('two presses under one permission prompt make one recording', async () => {
  const first = toggle(ui(), opts);
  const second = toggle(ui(), opts);
  for (const grant of prompts) grant();
  await Promise.all([first, second]);
  assert.equal(recorders.filter((r) => r.state === 'recording').length, 1);
  assert.equal(streams.filter((s) => !s.track.stopped).length, 1, 'only the recording holds a microphone');
});

test('a press with nothing in its way still records', async () => {
  const u = ui();
  const press = toggle(u, opts);
  prompts[0]();
  await press;
  assert.equal(recorders.length, 1);
  assert.equal(recorders[0].state, 'recording');
  assert.equal(u.mic.attrs['aria-pressed'], 'true');
});
