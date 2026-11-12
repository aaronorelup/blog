// The search box once it is unmounted (src/scripts/search/box.js; the homepage overlay unmounts it when the panel
// closes or moves on): a first microphone press whose hear.js is still loading must not ask for the microphone
// afterwards, when there is no box left to show a recording or stop it. The page is faked, just enough to mount.
import test from 'node:test';
import assert from 'node:assert/strict';

function fake(extra = {}) {
  const parts = {};
  return { listeners: {}, dataset: { examples: '["An example question"]' }, value: '', hidden: false,
    classList: { add() {}, remove() {}, toggle() {} },
    querySelector(s) { return (parts[s] ??= fake()); }, querySelectorAll: () => [],
    addEventListener(type, fn) { this.listeners[type] = fn; }, removeEventListener(type) { delete this.listeners[type]; },
    setAttribute() {}, removeAttribute() {}, focus() {}, select() {}, replaceChildren() {}, append() {}, remove() {}, ...extra };
}
globalThis.window = globalThis;
globalThis.matchMedia = () => ({ matches: false });
globalThis.location = { hostname: 'localhost', reload() {}, assign() {} };
globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = fake({ createElement: () => fake(), head: fake(), activeElement: null, hidden: false });
globalThis.fetch = async () => ({ ok: true, json: async () => ({ ask: true, voice: true }) });
let microphoneAsked = 0;
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
  mediaDevices: { getUserMedia: () => { microphoneAsked += 1; return new Promise(() => {}); } },
} });
globalThis.MediaRecorder = class {};

const { mount } = await import('../../src/scripts/search/box.js');

test('a microphone press still loading when the box is unmounted never asks for the microphone', async () => {
  const root = fake();
  const unmount = mount(root);
  const form = root.querySelector('[data-search]');
  const modes = form.querySelector('.search-modes');
  const mic = form.querySelector('[data-mic]');
  await modes.listeners.click({ target: { closest: () => ({ dataset: { mode: 'ask' } }) } });
  assert.equal(mic.hidden, false, 'Ask is open and the microphone shows');

  const press = mic.listeners.click();    // the first press: hear.js starts loading
  unmount();                              // the panel closes before it is in
  await press;
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(microphoneAsked, 0);
});

test('with the box still mounted, the press asks for the microphone', async () => {
  const root = fake();
  const unmount = mount(root);
  const form = root.querySelector('[data-search]');
  await form.querySelector('.search-modes').listeners.click({ target: { closest: () => ({ dataset: { mode: 'ask' } }) } });
  const before = microphoneAsked;
  form.querySelector('[data-mic]').listeners.click();
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(microphoneAsked, before + 1);
  unmount();
});
