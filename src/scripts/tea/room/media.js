// The one module that decides what plays on the tea room (2.9). A loop (RoomLoop: muted, looping, inline, no
// autoplay) plays while it is in view and pauses out of it; none plays in book mode, with ?still=1, with reduced
// motion, or while a film or an embed runs. A film is a <video controls> RoomEmbed's button makes; a game or a lab
// machine is an <ao-game>, loaded at once so its own poster and button are never seen. <ao-game> brings the site's
// player.js, which pauses everything else on any `play`: so a capturing listener stops the event for every loop
// before player.js can see it, and loops never stop the reader's game. player.js is not edited.
export function media(doc, { live, still }) {
  let running = 0;
  const loops = [...doc.querySelectorAll('video[data-room-loop]')];
  addEventListener('play', (e) => { if (e.target?.hasAttribute?.('data-room-loop')) e.stopImmediatePropagation(); }, true);
  const may = () => live && !still() && !running;
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
    }
    sync();
  }, { threshold: 0.2 });
  function sync() {
    for (const v of loops) {
      if (seen.has(v) && may()) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }
  }
  loops.forEach((v) => io.observe(v));

  for (const box of doc.querySelectorAll('[data-room-embed]')) {
    const button = box.querySelector('[data-room-play]');
    if (!button) continue;
    button.addEventListener('click', () => start(box));
  }

  async function start(box) {
    const { kind, in: where, src } = box.dataset;
    running++;
    box.dataset.running = '';
    sync();
    const frame = doc.createElement('div');
    frame.className = 'room-embed-frame';
    let host = box;
    let sheet = null;
    if (where === 'sheet') {
      sheet = doc.createElement('dialog');
      sheet.className = 'room-sheet';
      const close = doc.createElement('button');
      close.type = 'button';
      close.className = 'room-button';
      close.textContent = box.dataset.close ?? '';
      close.addEventListener('click', () => sheet.close());
      sheet.append(close);
      doc.body.append(sheet);
      host = sheet;
    }
    host.append(frame);
    if (kind === 'film') {
      const v = doc.createElement('video');
      v.controls = true;
      v.preload = 'none';
      v.src = src;
      frame.append(v);
      v.play().catch(() => {});
    } else {
      await import('../../../elements/registry.js').then(({ upgrade }) => {
        const g = doc.createElement('ao-game');
        g.setAttribute('src', src);
        frame.append(g);
        upgrade(frame);
        customElements.whenDefined('ao-game').then(() => g.load?.());
      });
    }
    const end = () => { running = Math.max(0, running - 1); delete box.dataset.running; frame.remove(); sheet?.remove(); sync(); };
    if (sheet) {
      // Esc closes the sheet even while the machine inside it has the keyboard: a key pressed in the machine's own
      // page never reaches the dialog, so the page (same origin, never edited) is listened to from here.
      sheet.addEventListener('load', (e) => {
        if (e.target.tagName !== 'IFRAME') return;
        try { e.target.contentWindow.addEventListener('keydown', (k) => { if (k.key === 'Escape') sheet.close(); }); } catch {}
      }, true);
      sheet.addEventListener('close', end);
      sheet.showModal();
    }
  }
}
