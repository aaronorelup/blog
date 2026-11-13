// The frame-rate meter behind ?meter=1 (2.9): a button starts a scripted scroll of the whole page at 540 px a second,
// and at the end the meter shows the median frames a second, the worst second and the longest frame. For the
// owner's own machine and phone; an agent's machine measures only its software renderer.
export function meter(doc = document) {
  const box = doc.querySelector('[data-room-meter]');
  if (!box) return;
  box.hidden = false;
  const button = box.querySelector('button');
  const out = box.querySelector('output');
  const words = box.dataset;
  button.addEventListener('click', () => {
    button.disabled = true;
    const max = doc.documentElement.scrollHeight - innerHeight;
    const stamps = [];
    const t0 = performance.now();
    scrollTo(0, 0);
    const step = (now) => {
      stamps.push(now);
      const y = ((now - t0) / 1000) * 540;
      scrollTo(0, Math.min(max, y));
      if (y < max) return requestAnimationFrame(step);
      const seconds = new Map();
      for (const s of stamps) seconds.set(Math.floor((s - t0) / 1000), (seconds.get(Math.floor((s - t0) / 1000)) ?? 0) + 1);
      const counts = [...seconds.values()].slice(0, -1).sort((a, b) => a - b);
      const median = counts[Math.floor(counts.length / 2)] ?? 0;
      const longest = Math.max(...stamps.slice(1).map((s, i) => s - stamps[i]));
      out.textContent = `${words.median} ${median} · ${words.worst} ${counts[0] ?? 0} · ${words.longest} ${Math.round(longest)} ms`;
      button.disabled = false;
    };
    requestAnimationFrame(step);
  });
}
