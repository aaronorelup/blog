// The browser's own voice (Web Speech), free: for a post not recorded yet, or by choice. One utterance per block,
// which also dodges Chrome cutting long ones off; its word boundaries mark the word, and a voice that sends none
// leaves the block marked. Pause is cancel-and-remember, since pause and resume are unreliable on Android.
// speech(blocks, on) → the engine index.js drives; blocks: dom.js's Map, in reading order.
export function speech(blocks, on) {
  const synth = window.speechSynthesis;
  const order = [...blocks.keys()];
  let at = { i: 0, c: 0 }, rate = 1, want = false, gen = 0;

  function say(i, c) {
    const g = ++gen;
    const r = order[i];
    const { text } = blocks.get(r);
    const u = new SpeechSynthesisUtterance(text.slice(c));
    u.lang = document.documentElement.lang || 'en';
    u.rate = rate;
    at = { i, c };
    u.onstart = () => { if (g === gen) on.block(r); };
    u.onboundary = (e) => {
      if (g !== gen || e.name !== 'word') return;
      const c0 = c + e.charIndex;
      const c1 = c0 + (e.charLength || /^\S*/.exec(text.slice(c0))[0].length || 1);
      at = { i, c: c0 };
      on.word(r, c0, c1);
    };
    u.onend = () => {
      if (g !== gen) return;
      if (i + 1 < order.length) { say(i + 1, 0); return; }
      want = false;
      at = { i: 0, c: 0 };
      on.state();
      on.end();
    };
    u.onerror = (e) => {
      if (g !== gen || e.error === 'interrupted' || e.error === 'canceled') return;
      want = false;
      on.state();
    };
    synth.speak(u);
  }

  return {
    play(from) {
      if (from) at = { i: Math.max(0, order.indexOf(from.r)), c: from.c };
      gen++;
      synth.cancel();
      want = true;
      say(at.i, at.c);
      on.state();
    },
    pause() { gen++; want = false; synth.cancel(); on.state(); },
    playing: () => want,
    rate(x) { rate = x; if (want) this.play(); },
    close() { gen++; want = false; synth.cancel(); },
  };
}
