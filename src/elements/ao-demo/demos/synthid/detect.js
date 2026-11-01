// Part detect: the checker recreates each token's round assignments and counts the +. Mounted by index.js.
import { h } from '../../../_lib/dom.js';
import { detect, isWord, KEYS, LETTER_CLAUDE, LETTER_PLAIN, tokenize } from './model.js';
import { lede, legend, scorePanel, segmented, tokenDetail, tokenView } from './ui.js';

// ------------------------------------------------------------------------------------------
// Part: detect.
export function partDetect(root) {
  let which = 'claude';
  let limit = Infinity;
  let picked = -1;
  let r;
  const view = tokenView((i) => { picked = i; detail(); });
  const panel = scorePanel();
  const info = h('p', { class: 'sid-note sid-detail' });
  const totalWords = tokenize(LETTER_CLAUDE).filter((x) => isWord(x.t)).length;
  const range = h('input', { type: 'range', min: '10', max: String(totalWords), value: String(totalWords), 'aria-label': 'Words checked' });
  const rangeOut = h('span', { class: 'sid-slider-out' });
  range.addEventListener('input', () => { limit = Number(range.value); render(); });
  const key = () => (which === 'other' ? KEYS.other : KEYS.claude);
  function detail() {
    info.replaceChildren(picked >= 0 ? tokenDetail(r, picked, key()) : 'Click any word to see its 30 round assignments.');
  }
  function render() {
    const text = which === 'plain' ? LETTER_PLAIN : LETTER_CLAUDE;
    r = detect(text, { key: key(), limitWords: limit });
    rangeOut.textContent = `${Math.min(limit, totalWords)} of ${totalWords} words`;
    view.render(r);
    panel.update(r);
    detail();
  }
  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 3 · the checker'),
    lede('A letter the toy model wrote. The checker reads it one token at a time: it takes the four previous tokens and the key, recreates that token’s 30 round assignments, and counts the +.'),
    segmented([['claude', 'Claude’s letter'], ['plain', 'A letter written without the watermark'], ['other', 'Claude’s letter, checked with a different key']], which, (v) => { which = v; picked = -1; render(); }, 'Text'),
    h('label', { class: 'sid-slider' }, h('span', null, 'Check only the first'), range, rangeOut),
    legend(false),
    view.el,
    info,
    panel.el,
  );
  render();
  return {};
}
