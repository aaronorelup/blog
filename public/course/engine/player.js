/* The Missing Map — player.js
   The lesson page around the canvas: play/pause synced to the narration, scrubber with
   chapter ticks, captions, speed, fullscreen, chapter list, takeaways and a clickable
   transcript. The canvas is always drawn from audio.currentTime, so picture and voice
   cannot drift apart. */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem('mm.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('mm.' + k, v); } catch (e) { /* private mode */ } },
  };
  const fmt = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60), x = Math.floor(s % 60); return `${m}:${String(x).padStart(2, '0')}`; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // day/night toggle (night is the default face)
  const mode = store.get('mode'); if (mode) document.documentElement.dataset.mode = mode;
  const modeBtn = $('#mode');
  if (modeBtn) modeBtn.addEventListener('click', () => {
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    const cur = document.documentElement.dataset.mode || (dark ? 'night' : 'day');
    const next = cur === 'night' ? 'day' : 'night';
    document.documentElement.dataset.mode = next; store.set('mode', next);
  });

  if (navigator.webdriver && /render=1/.test(location.search)) return; // the renderer drives the canvas itself

  window.__ready.then(() => {
    const TL = window.__timeline, DEF = window.__lesson, DUR = TL.dur;
    document.title = `${DEF.id} ${DEF.title} · The Missing Map`;
    $('#eyebrow').innerHTML = `Lesson ${esc(DEF.id)} · ${esc(DEF.module || '')}` + (DEF.poc ? '<span class="tag">Proof of concept</span>' : '') + (!TL.narrated ? '<span class="tag">Draft · no narration yet</span>' : '');
    $('#title').textContent = DEF.title;
    if (TL.voice && TL.voice.name && $('#filed')) $('#filed').textContent += ` · narrated by ${TL.voice.name.split(/\s[-–—]\s/)[0]} (ElevenLabs voice library)`;
    $('#summary').textContent = DEF.summary || '';

    // takeaways
    const keep = $('#keep');
    (DEF.keep || []).forEach((k) => { const li = document.createElement('li'); li.innerHTML = `<b>${esc(k[0])}</b> ${esc(k[1] || '')}`; keep.appendChild(li); });
    if (!(DEF.keep || []).length) $('#keepbox').hidden = true;

    // audio (or a silent clock while the lesson is still a draft)
    let audio = null, clockT = 0, clockAt = 0, playing = false;
    if (TL.narrated) {
      audio = new Audio(); audio.preload = 'auto';
      audio.addEventListener('error', () => { audio = null; });
      const src = 'audio/mix.mp3';
      if (/^https?:/.test(location.protocol)) {
        // aaronorelup.com answers Range requests with a plain 200, which makes a streamed <audio>
        // unseekable (scrubbing and chapter jumps snap back to 0:00). A blob URL is always seekable,
        // so the narration (~6 MB) is fetched whole before the first play.
        const bp = $('#bigplay'); bp.disabled = true; bp.textContent = 'Loading lesson…';
        fetch(src).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.blob(); })
          .then((b) => { if (audio) audio.src = URL.createObjectURL(b); })
          .catch(() => { if (audio) audio.src = src; })
          .finally(() => { bp.disabled = false; bp.textContent = 'Play lesson'; });
      } else audio.src = src;
    }
    const now = () => (audio ? audio.currentTime : playing ? clockT + (performance.now() - clockAt) / 1000 * rate : clockT);
    let rate = 1, started = false;
    // before the first play the stage shows a poster frame instead of the black fade-in at 0:00
    const posterT = Math.min(DEF.poster ?? 2.5, DUR);
    const setT = (t) => { started = true; t = Math.max(0, Math.min(DUR - 0.01, t)); if (audio) audio.currentTime = t; clockT = t; clockAt = performance.now(); draw(true); };
    const play = () => { if (audio && !audio.src) return; started = true; if (audio) audio.play(); clockT = now(); clockAt = performance.now(); playing = true; $('#bigplay').hidden = true; $('#play').textContent = 'Pause'; };
    const pause = () => { clockT = now(); if (audio) audio.pause(); playing = false; $('#play').textContent = 'Play'; };
    const toggle = () => (playing ? pause() : play());
    if (audio) audio.addEventListener('ended', () => { pause(); });

    $('#bigplay').addEventListener('click', play);
    $('#play').addEventListener('click', toggle);
    $('#stage').addEventListener('click', (e) => { if (e.target.id !== 'bigplay') toggle(); });

    // scrubber + chapter ticks
    const scrub = $('#scrub'), ticks = $('#ticks');
    TL.sections.forEach((s, i) => { if (!i) return; const el = document.createElement('i'); el.style.left = (s.start / DUR * 100) + '%'; ticks.appendChild(el); });
    let dragging = false;
    scrub.addEventListener('input', () => { dragging = true; setT(scrub.value / 1000 * DUR); });
    scrub.addEventListener('change', () => { dragging = false; });

    // speed
    const speeds = [1, 1.25, 1.5, 1.75, 2]; let si = 0;
    $('#speed').addEventListener('click', () => { clockT = now(); clockAt = performance.now(); si = (si + 1) % speeds.length; rate = speeds[si]; if (audio) audio.playbackRate = rate; $('#speed').textContent = rate + '×'; });

    // captions
    let ccOn = store.get('cc') !== '0';
    const ccBtn = $('#ccbtn'); ccBtn.setAttribute('aria-pressed', ccOn);
    ccBtn.addEventListener('click', () => { ccOn = !ccOn; ccBtn.setAttribute('aria-pressed', ccOn); store.set('cc', ccOn ? '1' : '0'); draw(true); });
    if (!TL.captions.length) ccBtn.hidden = true;

    // fullscreen
    $('#fs').addEventListener('click', () => { const st = $('#stage'); document.fullscreenElement ? document.exitFullscreen() : st.requestFullscreen && st.requestFullscreen(); });

    // download link when the MP4 has been published next to the page
    if (/^https?:/.test(location.protocol)) fetch('lesson.mp4', { method: 'HEAD' }).then((r) => { if (r.ok) $('#dl').hidden = false; }).catch(() => {});

    // chapters
    const chap = $('#chapters');
    TL.sections.forEach((s) => {
      const li = document.createElement('li'), b = document.createElement('button');
      b.innerHTML = `<span class="n">${esc(s.n)}</span><span>${esc(s.title || 'Scene ' + s.n)}</span><span class="ts">${fmt(s.start)}</span>`;
      b.addEventListener('click', () => { setT(Math.max(0, s.start - 0.3)); if (!playing) play(); });
      li.appendChild(b); chap.appendChild(li);
    });

    // transcript
    const tx = $('#tx'), spans = [];
    TL.sections.forEach((s) => {
      if (!s.words || !s.words.length) return;
      const h = document.createElement('h3'); h.textContent = s.title || ''; tx.appendChild(h);
      const p = document.createElement('p');
      (s.shown && s.shown.length ? s.shown : s.words).forEach((w) => { const sp = document.createElement('span'); sp.textContent = w[0]; sp.dataset.s = w[1]; sp.addEventListener('click', () => setT(w[1])); p.appendChild(sp); p.appendChild(document.createTextNode(' ')); spans.push([w[1], w[2], sp]); });
      tx.appendChild(p);
    });
    if (!spans.length) $('#txbox').hidden = true;

    // keyboard
    document.addEventListener('keydown', (e) => {
      if (e.target.closest('input, textarea, select') && e.key !== ' ') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') setT(now() + 5);
      else if (e.key === 'ArrowLeft') setT(now() - 5);
      else if (e.key === 'f') $('#fs').click();
      else if (e.key === 'c') ccBtn.click();
      else if (/^[0-9]$/.test(e.key)) setT(DUR * Number(e.key) / 10);
    });

    const cc = $('#cc'), timeEl = $('#time');
    let lastSpan = null, lastCap = null, lastChap = -1;
    const chapBtns = [...chap.querySelectorAll('button')];
    function draw(force) {
      const T = now();
      if (!playing && !force) return;
      window.__seek(started ? T : posterT);
      if (!dragging) scrub.value = Math.round(T / DUR * 1000);
      timeEl.textContent = `${fmt(T)} / ${fmt(DUR)}`;
      // captions
      let cap = '';
      if (ccOn) for (const c of TL.captions) { if (T >= c[1] && T < c[2]) { cap = c[0]; break; } }
      if (cap !== lastCap) { cc.textContent = cap; cc.classList.toggle('on', !!cap); lastCap = cap; }
      // transcript word
      let cur = null;
      for (let i = 0; i < spans.length; i++) { if (T >= spans[i][0] && T < spans[i][1] + 0.25) { cur = spans[i][2]; break; } }
      if (cur !== lastSpan) {
        if (lastSpan) lastSpan.classList.remove('now');
        if (cur) { cur.classList.add('now'); const box = tx.getBoundingClientRect(), r = cur.getBoundingClientRect(); if (r.top < box.top || r.bottom > box.bottom) tx.scrollTop += r.top - box.top - box.height / 3; }
        lastSpan = cur;
      }
      // current chapter
      let ci = 0; TL.sections.forEach((s, i) => { if (T >= s.start - 0.5) ci = i; });
      if (ci !== lastChap) { chapBtns.forEach((b, i) => b.classList.toggle('now', i === ci)); lastChap = ci; }
      if (!audio && playing && T >= DUR - 0.02) pause();
    }
    (function loop() { draw(false); requestAnimationFrame(loop); })();
    draw(true);
    window.__player = { get audio() { return audio; }, now, setT, play, pause, draw };  // for debugging
  });
})();
