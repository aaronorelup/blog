/* The Hidden Curriculum: player.js
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

  // day/night: the same switch, storage key and default (night) as the rest of aaronorelup.com
  const SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBF3E8" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.4" fill="#FBF3E8" stroke="none"></circle><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"></path></svg>';
  const MOON = '<svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 14.6A8.6 8.6 0 1 1 9.4 3.8a6.9 6.9 0 0 0 10.8 10.8Z" fill="#151726"></path></svg>';
  const modeBtn = $('#mode'), knob = $('#mode-knob');
  const paintMode = () => {
    const night = document.documentElement.dataset.mode !== 'day';
    if (modeBtn) modeBtn.setAttribute('aria-pressed', night ? 'true' : 'false');
    if (knob) { knob.style.transform = night ? 'translateX(36px)' : 'translateX(0)'; knob.innerHTML = night ? MOON : SUN; }
  };
  if (modeBtn) modeBtn.addEventListener('click', () => {
    const night = document.documentElement.dataset.mode !== 'day';
    if (night) document.documentElement.dataset.mode = 'day'; else delete document.documentElement.dataset.mode;
    try { localStorage.setItem('scene-mode', night ? 'day' : 'night'); } catch (e) { /* private mode */ }
    paintMode();
  });
  paintMode();

  if (navigator.webdriver && /render=1/.test(location.search)) return; // the renderer drives the canvas itself

  // a lesson with video or sound exhibits downloads them whole before its first frame (runtime.js): show how far along
  window.addEventListener('lesson-media', (e) => {
    const bp = $('#bigplay'), d = e.detail || {};
    if (bp && !window.__readyDone) bp.textContent = d.total ? `Loading lesson… ${Math.min(99, Math.round(100 * d.got / d.total))}%` : 'Loading lesson…';
  });

  window.__ready.then(() => {
    const TL = window.__timeline, DEF = window.__lesson, DUR = TL.dur;
    document.title = `${DEF.id} ${DEF.title} · The Hidden Curriculum · Aaron Orelup`;
    $('#eyebrow').innerHTML = `Lesson ${esc(DEF.id)} · ${esc(DEF.module || '')}` + (DEF.poc ? '<span class="tag">Proof of concept</span>' : '') + (!TL.narrated ? '<span class="tag">Draft · no narration yet</span>' : '');
    $('#title').textContent = DEF.title;
    if ($('#crumb-id')) $('#crumb-id').textContent = `Lesson ${DEF.id}`;
    if (TL.voice && TL.voice.name && $('#filed')) $('#filed').textContent += ` · narrated by ${TL.voice.name.split(/\s[-–—]\s/)[0]}${TL.guestVoice && TL.guestVoice.name ? `, with guest ${TL.guestVoice.name.split(/\s[-–—]\s/)[0]}` : ''} (ElevenLabs voice library)`;
    $('#summary').textContent = DEF.summary || '';

    // takeaways
    const keep = $('#keep');
    (DEF.keep || []).forEach((k) => { const li = document.createElement('li'); li.innerHTML = `<b>${esc(k[0])}</b> ${esc(k[1] || '')}`; keep.appendChild(li); });
    if (!(DEF.keep || []).length) $('#keepbox').hidden = true;

    // credits: the sources this lesson is built on (lesson.js `credits`, since 2026-10-12; legacy pages have none)
    const cred = $('#credits');
    if (cred) {
      const list = (DEF.credits || []).filter((c) => c && (c.title || c.who));
      list.forEach((c) => {
        const li = document.createElement('li');
        const title = c.url && /^https?:\/\//.test(c.url) ? `<a href="${esc(c.url)}" rel="noreferrer noopener">${esc(c.title || c.url)}</a>` : esc(c.title || '');
        li.innerHTML = `${c.who ? `<b>${esc(c.who)}</b>, ` : ''}${title}${c.date ? ` <span class="d">(${esc(c.date)})</span>` : ''}`;
        cred.appendChild(li);
      });
      if (!list.length && $('#creditsbox')) $('#creditsbox').hidden = true;
    }

    // audio (or a silent clock while the lesson is still a draft)
    let audio = null, clockT = 0, clockAt = 0, playing = false, wantPlay = false;
    if (TL.narrated) {
      audio = new Audio(); audio.preload = 'auto';
      audio.addEventListener('error', () => { audio = null; });
      const src = 'audio/mix.mp3';
      if (/^https?:/.test(location.protocol)) {
        // aaronorelup.com answers Range requests with a plain 200, which makes a streamed <audio>
        // unseekable (scrubbing and chapter jumps snap back to 0:00). A blob URL is always seekable,
        // so the narration (~6 MB) is fetched whole before the first play.
        // A press while it loads is remembered and plays the moment the audio is in.
        const bp = $('#bigplay'); bp.textContent = 'Loading lesson…';
        const readAll = async (r) => {
          if (!r.ok) throw new Error(String(r.status));
          const total = Number(r.headers.get('content-length')) || 0;
          if (!r.body || !total) return r.blob();
          const reader = r.body.getReader(), parts = []; let got = 0;
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            parts.push(value); got += value.length;
            if (!wantPlay) bp.textContent = `Loading lesson… ${Math.min(99, Math.round(100 * got / total))}%`;
          }
          return new Blob(parts, { type: 'audio/mpeg' });
        };
        fetch(src).then(readAll)
          .then((b) => { if (audio) audio.src = URL.createObjectURL(b); })
          .catch(() => { if (audio) audio.src = src; })
          .finally(() => { bp.textContent = 'Play lesson'; if (wantPlay) { wantPlay = false; play(); } });
      } else audio.src = src;
    }
    const now = () => (audio ? audio.currentTime : playing ? clockT + (performance.now() - clockAt) / 1000 * rate : clockT);
    let rate = 1, started = false;
    // before the first play the stage shows a poster frame instead of the black fade-in at 0:00
    const posterT = Math.min(DEF.poster ?? 2.5, DUR);
    const setT = (t) => { started = true; t = Math.max(0, Math.min(DUR - 0.01, t)); if (audio) audio.currentTime = t; clockT = t; clockAt = performance.now(); draw(true); };
    const play = () => { if (audio && !audio.src) { wantPlay = true; $('#bigplay').textContent = 'Starting…'; $('#play').textContent = 'Loading…'; return; } started = true; if (audio) audio.play(); clockT = now(); clockAt = performance.now(); playing = true; $('#bigplay').hidden = true; $('#play').textContent = 'Pause'; };
    const pause = () => {
      clockT = now(); if (audio) audio.pause(); playing = false; $('#play').textContent = 'Play';
      if (clips.length || sounds.length) { clips.forEach((v) => v.pause()); sounds.forEach(([, a]) => a.pause()); draw(true); }
    };
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
    $('#speed').addEventListener('click', () => { clockT = now(); clockAt = performance.now(); si = (si + 1) % speeds.length; rate = speeds[si]; if (audio) audio.playbackRate = rate; $('#speed').textContent = rate + '×'; draw(true); });

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
      // leave the browser's own shortcuts (Ctrl+F, Ctrl+C...) and a focused control's own keys alone
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const tg = e.target;
      if (tg.closest('input, textarea, select') && !(e.key === ' ' && tg.id === 'scrub')) return;
      if (e.key === ' ' && tg.closest('button, a, summary') && !['play', 'bigplay'].includes(tg.id)) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle(); }
      else if (e.key === 'ArrowRight') setT(now() + 5);
      else if (e.key === 'ArrowLeft') setT(now() - 5);
      else if (e.key === 'f') $('#fs').click();
      else if (e.key === 'c') ccBtn.click();
      else if (/^[0-9]$/.test(e.key)) setT(DUR * Number(e.key) / 10);
    });

    // media exhibits (lesson.js videos:{} and sounds:{}). K.video draws whatever frame each <video> shows, so the clips
    // the drawn scene asks for (K.want, refilled by every draw) play muted in step with the narration clock. Smooth, not
    // frame-exact: a playing clip more than 0.15 s off is re-seeked, a smaller drift is steered out with the playback
    // rate. Paused or scrubbed, each clip is seeked to its exact frame and the stage redrawn on 'seeked'. Clips no
    // scene wants are paused. Sounds (K.heard) play at 1x from where the scene is, re-seeked when more than 0.1 s off.
    const clips = Object.values((window.K && K.vid) || {});
    const sounds = Object.entries((window.K && K.snd) || {});
    const pace = new Map();   // clip or sound -> {T, m, speed}: last sample of the scene's media clock (1 = real time, 0 = held)
    // guess: the speed assumed until the first 0.1 s has been measured (clips: 0, hold the frame; sounds: 1, so a
    // sound's first 0.1 s is not lost)
    const paceOf = (key, T, m, guess) => {
      let p = pace.get(key);
      if (!p || T < p.T || T - p.T > 1 || m < p.m - 0.001) p = { T, m, speed: p ? p.speed : guess };   // new, scrubbed or looped
      else if (T - p.T >= 0.1) p = { T, m, speed: (m - p.m) / (T - p.T) };
      pace.set(key, p);
      return p.speed;
    };
    clips.forEach((v) => v.addEventListener('seeked', () => { if (!playing) draw(true); }));
    // Chromium drops a clip's readyState while it seeks, and a <video> in that state draws nothing: keep a copy of
    // the frame on screen (v.__hold, which K.video draws meanwhile) so a scrub or resync never flashes the box empty
    const seekClip = (v, t) => {
      if (v.readyState >= 2 && v.videoWidth) {
        const c = v.__hold || (v.__hold = document.createElement('canvas'));
        if (c.width !== v.videoWidth || c.height !== v.videoHeight) { c.width = v.videoWidth; c.height = v.videoHeight; }
        c.getContext('2d').drawImage(v, 0, 0);
      }
      v.currentTime = t;
    };
    function syncClips(T) {
      clips.forEach((v) => {
        const w = K.want.get(v);
        if (!w) { if (!v.paused) v.pause(); pace.delete(v); return; }
        const speed = paceOf(v, T, w.m, 0);
        if (v.loop !== !!w.loop) v.loop = !!w.loop;
        if (playing && speed > 0.05) {
          const drift = v.currentTime - w.m, lead = 0.05 * speed * rate;   // + = the clip runs ahead; lead covers the seek itself
          // more than 0.15 s off (or starting more than a frame off): jump; a smaller drift is steered out with the
          // playback rate (at most 20 %, nothing inside half a frame), so the picture never visibly skips
          if (!v.seeking && (Math.abs(drift) > 0.15 || (v.paused && Math.abs(drift) > 1 / w.fps))) seekClip(v, w.m + lead);
          const steer = Math.abs(drift) < 0.5 / w.fps ? 0 : Math.max(-0.2, Math.min(0.2, -2 * drift));
          const r = Math.min(16, Math.max(0.0625, speed * rate * (1 + steer)));
          if (Math.abs(v.playbackRate - r) > 0.005) v.playbackRate = r;
          if (v.paused && !(v.ended && !w.loop)) v.play().catch(() => {});
        } else {
          if (!v.paused) v.pause();
          if (Math.abs(v.currentTime - w.t) > 0.5 / w.fps && !v.seeking) seekClip(v, w.t);
        }
      });
    }
    function syncSounds(T) {
      sounds.forEach(([name, a]) => {
        const h = K.heard.get(name);
        if (!h) { if (!a.paused) a.pause(); pace.delete(a); return; }
        const speed = paceOf(a, T, h.m, 1);
        // like the MP4 (tools/render.py), a sound plays only while its time runs with the lesson clock
        if (!playing || Math.abs(speed - 1) > 0.1) { if (!a.paused) a.pause(); return; }
        const vol = Math.min(1, Math.max(0, h.gain));
        if (Math.abs(a.volume - vol) > 0.001) a.volume = vol;
        // start (or jump back in) exactly where the scene is, and re-seek only past 0.1 s. No rate steering as for clips:
        // Chromium's <audio> stalls ~40 ms on every playbackRate change (measured 2026-10-12), so steering never settles
        if (!a.seeking && (a.paused || Math.abs(a.currentTime - h.m) > 0.1)) a.currentTime = h.m;
        if (Math.abs(a.playbackRate - rate) > 0.001) a.playbackRate = rate;
        if (a.paused) a.play().catch(() => {});
      });
    }

    const cc = $('#cc'), timeEl = $('#time');
    let lastSpan = null, lastCap = null, lastChap = -1;
    const chapBtns = [...chap.querySelectorAll('button')];
    function draw(force) {
      const T = now();
      if (!playing && !force) return;
      window.__seek(started ? T : posterT);
      // a hidden tab: Chromium pauses video-only media there anyway, so park the clips (they re-sync when it shows again)
      if (clips.length) { if (document.hidden) clips.forEach((v) => { if (!v.paused) v.pause(); }); else syncClips(started ? T : posterT); }
      if (sounds.length) syncSounds(started ? T : posterT);
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
    // a hidden tab gets no animation frames while the narration plays on: keep the sounds starting and stopping on cue
    // (Chromium runs a hidden tab's timers about once a second, so a sound may start up to a second in, at its right time)
    if (sounds.length || clips.length) setInterval(() => { if (document.hidden && playing) draw(false); }, 250);
    draw(true);
    window.__player = { get audio() { return audio; }, now, setT, play, pause, draw, clips, sounds };  // for debugging
  });
})();
