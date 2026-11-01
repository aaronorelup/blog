// The answer stream to the browser: server-sent events, each "data: <json>\n\n" with its type in t (docs/WORKER.md,
// POST /api/ask). After 10 s without an event a { t: 'wait' } goes out, well inside Cloudflare's 100 s idle limit. A
// reader who closed the tab makes every later write a no-op, never a throw: the run goes on to settle and cache.
const HEADERS = { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' };
export const HEARTBEAT = 10e3;
const enc = new TextEncoder();
export const frame = (t, data = {}) => `data: ${JSON.stringify({ t, ...data })}\n\n`;

// A finished stream of one event (off, resting, a cached answer).
export const once = (t, data) => new Response(frame(t, data), { headers: HEADERS });

export function sse() {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  let open = true;
  let quiet = 0;
  const send = (t, data) => {
    clearTimeout(quiet);
    if (!open) return;
    writer.write(enc.encode(frame(t, data))).catch(() => { open = false; });
    quiet = setTimeout(() => send('wait'), HEARTBEAT);
  };
  const close = () => {
    clearTimeout(quiet);
    if (open) writer.close().catch(() => {});
    open = false;
  };
  return { response: new Response(readable, { headers: HEADERS }), send, close, gone: () => !open };
}
