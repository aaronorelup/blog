// The frame-rate meter behind ?meter=1 (2.9): a button starts a scripted scroll at 540 px a second, and at the end
// the meter shows the median frames a second, the worst second and the longest frame. The whole page, or a stretch
// of it: &from= and &to= take a share of the page (0.2) or a chapter's id (tv; as &to= it means that chapter's
// end). For the owner's own machine and phone; an agent's machine measures only its software renderer.
// scripts/tools/tea/fps.mjs runs the same scrollRun() and meterStats() on this page and on look B, so the two
// are measured by one piece of code. The result is also left on the box as data-result (JSON), for that tool.

export const SPEED = 540; // px a second

// One time-driven scroll from px a to px b at speed px a second: the animation frames' time stamps, in ms from its
// start. Self-contained (it reads nothing outside its arguments and the window), so a tool can run its source on
// any page.
export function scrollRun(a, b, speed) {
  return new Promise((resolve) => {
    scrollTo(0, a);
    requestAnimationFrame((t0) => {
      const stamps = [];
      const dir = b >= a ? 1 : -1;
      const step = (now) => {
        stamps.push(now - t0);
        const y = a + dir * ((now - t0) / 1000) * speed;
        const done = dir > 0 ? y >= b : y <= b;
        scrollTo(0, done ? b : y);
        if (done) resolve(stamps);
        else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  });
}

// Frames in each whole second (the last, partial second left out), their median and worst, and the longest frame
// in ms. Pure.
export function meterStats(stamps) {
  const counts = [];
  for (const s of stamps) { const i = Math.floor(s / 1000); counts[i] = (counts[i] ?? 0) + 1; }
  const whole = Array.from({ length: Math.max(0, Math.floor((stamps.at(-1) ?? 0) / 1000)) }, (_, i) => counts[i] ?? 0);
  const sorted = [...whole].sort((x, y) => x - y);
  const longest = stamps.length > 1 ? Math.max(...stamps.slice(1).map((s, i) => s - stamps[i])) : 0;
  return { seconds: whole, median: sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0, worst: sorted[0] ?? 0, longest: Math.round(longest), frames: stamps.length };
}

// A place given to the meter, in px of scroll: a share of the page, or a chapter's id (its top; as the end of a
// stretch, its bottom less one screen). null for anything else.
export function placePx(v, end, { max, vh, sections }) {
  if (v === null || v === undefined || v === '') return end ? max : 0;
  if (/^[\d.]+$/.test(v)) return Math.round(Math.min(1, Math.max(0, Number(v))) * max);
  const s = sections.find((x) => x.id === v);
  if (!s) return null;
  return Math.round(Math.min(max, Math.max(0, end ? s.top + s.height - vh : s.top)));
}

export function meter(doc = document) {
  const box = doc.querySelector('[data-room-meter]');
  if (!box) return;
  box.hidden = false;
  const button = box.querySelector('button');
  const out = box.querySelector('output');
  const words = box.dataset;
  const q = new URLSearchParams(location.search);
  button.addEventListener('click', async () => {
    button.disabled = true;
    delete box.dataset.result;
    const page = {
      max: doc.documentElement.scrollHeight - innerHeight,
      vh: doc.querySelector('.room-lvh')?.getBoundingClientRect().height || innerHeight,
      sections: [...doc.querySelectorAll('[data-room-chapter]')].map((s) => {
        const r = s.getBoundingClientRect();
        return { id: s.dataset.roomChapter, top: r.top + scrollY, height: r.height };
      }),
    };
    const a = placePx(q.get('from'), false, page) ?? 0;
    const b = placePx(q.get('to'), true, page) ?? page.max;
    const r = meterStats(await scrollRun(a, b, SPEED));
    out.textContent = `${words.median} ${r.median} · ${words.worst} ${r.worst} · ${words.longest} ${r.longest} ms`;
    box.dataset.result = JSON.stringify({ ...r, from: a, to: b });
    button.disabled = false;
  });
}
