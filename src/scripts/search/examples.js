// The Ask box's placeholder while it is empty: it steps every CYCLE_MS through the default line and the example
// questions (src/data/ask.js, rendered into the box as data-examples), from a random example, fading 300 ms between
// them. Typing stops it, emptying the box starts it again, a hidden page pauses it. Under reduced motion the first
// example stays, unchanged. The input's aria-label never cycles. examples(input, first, ms) returns { start, stop }.
const FADE = 300;   // ms, .search-input.is-swapping::placeholder (search.css)

export function examples(input, first, ms) {
  const list = [first, ...JSON.parse(input.dataset.examples)];
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let at = 0;
  let fresh = true;   // the first step after start() jumps to a random example; then the list loops in order
  let stepT = 0;
  let fadeT = 0;
  let on = false;
  const show = (i) => { at = i; input.placeholder = list[i]; };
  const step = () => {
    input.classList.add('is-swapping');
    fadeT = setTimeout(() => {
      show(fresh ? 1 + Math.floor(Math.random() * (list.length - 1)) : (at + 1) % list.length);
      fresh = false;
      input.classList.remove('is-swapping');
      arm();
    }, FADE);
  };
  const arm = () => {
    clearTimeout(stepT);
    if (on && !input.value && !document.hidden) stepT = setTimeout(step, ms - FADE);
  };
  const pause = () => {
    clearTimeout(stepT);
    clearTimeout(fadeT);
    input.classList.remove('is-swapping');
  };
  const onInput = () => (input.value ? pause() : arm());
  const onVisible = () => (document.hidden ? pause() : arm());
  return {
    start() {
      if (still) return show(1);
      on = true;
      fresh = true;
      show(0);
      input.addEventListener('input', onInput);
      document.addEventListener('visibilitychange', onVisible);
      arm();
    },
    stop() {
      on = false;
      pause();
      input.removeEventListener('input', onInput);
      document.removeEventListener('visibilitychange', onVisible);
    },
  };
}
