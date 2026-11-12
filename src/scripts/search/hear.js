// Ask by voice, loaded on the microphone's first press (box.js). A press records (getUserMedia, MediaRecorder: Chrome
// and Firefox give audio/webm or ogg with opus, Safari audio/mp4), a second press or 30 s stops it; the button shows
// the seconds. The recording goes once to POST /api/ask/hear with the Ask token, no retry, and is dropped; the text
// that comes back is asked like typed words (heard(text)). Nothing is kept in the page or the browser.
import { SAY, say } from './ask-answer.js';

export const LIMIT = 30e3;           // ms of recording at most
const MAX = 1 << 20;                 // bytes the Worker takes
const TYPES = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
export const HEAR = {
  mic: 'The microphone isn’t available here. Type the question instead.',
  missed: 'RAG Goobie didn’t catch that. Try again, or type it.',
  long: 'That recording was too long. Try a shorter question.',
};

let rec = null;                      // the recording under way
let press = null;                    // the newest press, while it waits on the microphone (the permission prompt)
let sending = false;

const clock = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

function showing(ui, on, label = '') {
  ui.mic.setAttribute('aria-pressed', String(on));
  ui.mic.setAttribute('aria-label', on ? 'Stop recording' : 'Ask by voice');
  ui.micTime.textContent = label;
  ui.voiceLine.hidden = !on && !label;
}

// Starts a recording, or stops the one under way. opts: { token(), forget(), heard(text), draw(node) }.
export async function toggle(ui, opts) {
  if (rec) return rec.recorder.stop();
  if (sending) return;
  const asked = (press = {});
  let stream = null;
  try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { /* no microphone */ }
  // The prompt can stay up for seconds: a press cancel() dropped meanwhile, or one a newer press replaced, lets the
  // microphone go and records nothing.
  if (press !== asked) return stream?.getTracks().forEach((t) => t.stop());
  press = null;
  if (!stream) return opts.draw(say(HEAR.mic));
  const mimeType = TYPES.find((t) => MediaRecorder.isTypeSupported?.(t));
  let recorder;
  try { recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 32000 } : {}); } catch {
    stream.getTracks().forEach((t) => t.stop());
    return opts.draw(say(HEAR.mic));
  }
  const chunks = [];
  const start = Date.now();
  const tick = setInterval(() => showing(ui, true, clock(Date.now() - start)), 250);
  const stopT = setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), LIMIT);
  const mine = (rec = { recorder, ui, dropped: false });
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  recorder.onstop = () => {
    clearInterval(tick);
    clearTimeout(stopT);
    stream.getTracks().forEach((t) => t.stop());
    rec = null;
    if (mine.dropped) return showing(ui, false);
    const type = (recorder.mimeType || mimeType || 'audio/webm').replace(/\s+/g, '');
    send(ui, opts, new Blob(chunks, { type }), type);
  };
  recorder.start(1000);
  showing(ui, true, clock(0));
}

async function send(ui, opts, blob, type) {
  if (blob.size > MAX) { showing(ui, false); return opts.draw(say(HEAR.long)); }
  sending = true;
  ui.mic.disabled = true;
  showing(ui, false, '…');
  try {
    const t = await opts.token();
    if (!t) return opts.draw(say(SAY.unsolved));
    const r = await fetch('/api/ask/hear', { method: 'POST', headers: { 'Content-Type': type, 'X-AO-Session': t }, body: blob });
    if (r.status === 401) opts.forget();
    if (!r.ok) return opts.draw(say(r.status === 401 ? SAY.expired : r.status === 429 ? SAY.busy : r.status === 400 ? HEAR.missed : SAY.down));
    const { text } = await r.json();
    if (typeof text !== 'string' || text.trim().length < 3) return opts.draw(say(HEAR.missed));
    opts.heard(text.trim());
  } catch {
    opts.draw(say(SAY.down));
  } finally {
    sending = false;
    ui.mic.disabled = false;
    showing(ui, false);
  }
}

// The box closed or Ask was left: a recording under way is dropped unsent, and a press still waiting on the
// microphone never starts one.
export function cancel() {
  press = null;
  if (!rec) return;
  rec.dropped = true;
  rec.recorder.stop();
}
