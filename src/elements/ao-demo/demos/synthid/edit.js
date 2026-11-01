// Part edit: what edits, rewording and tricks do to the checker's count. Mounted by index.js.
import { h } from '../../../_lib/dom.js';
import { detect, generate, isWord, KEYS, LETTER_CLAUDE, ngrams, SYNONYMS, tokenize } from './model.js';
import { btn, lede, legend, scorePanel, tokenDetail, tokenView } from './ui.js';

// ------------------------------------------------------------------------------------------
// Part: edit.
export function partEdit(root) {
  let refGrams = ngrams(LETTER_CLAUDE);
  let strip = true;
  let picked = -1;
  let r;
  const area = h('textarea', { class: 'sid-area', rows: '9', spellcheck: 'false', 'aria-label': 'The letter. Edit it and the checker updates.' });
  area.value = LETTER_CLAUDE;
  const view = tokenView((i) => { picked = i; info.replaceChildren(tokenDetail(r, i, KEYS.claude)); });
  const panel = scorePanel();
  const status = h('p', { class: 'sid-status', 'aria-live': 'polite' });
  const info = h('p', { class: 'sid-note sid-detail' });
  const kept = h('span', { class: 'sid-kept' });

  function render() {
    r = detect(area.value, { strip });
    view.render(r, refGrams);
    panel.update(r);
    const scored = r.toks.filter((x) => x.state === 'scored');
    const intact = scored.filter((x) => refGrams.has([...x.ctx, x.t].join('\u0002'))).length;
    kept.textContent = `${intact} of ${scored.length} checked tokens still have the same four previous tokens Claude wrote them after.`;
    if (picked >= 0) info.replaceChildren(tokenDetail(r, picked, KEYS.claude));
  }
  function set(text, msg, newRef) {
    area.value = text;
    if (newRef) refGrams = ngrams(newRef);
    picked = -1;
    info.textContent = '';
    status.replaceChildren(...[msg].flat());
    render();
  }
  function swap(rate) {
    const text = area.value;
    const toks = tokenize(text);
    const wordsN = toks.filter((x) => isWord(x.t)).length;
    const cands = toks.filter((x) => SYNONYMS.has(x.t));
    const want = Math.min(cands.length, Math.round(wordsN * rate));
    for (let i = cands.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cands[i], cands[j]] = [cands[j], cands[i]];
    }
    const chosen = cands.slice(0, want).sort((a, b) => b.at - a.at);
    let out = text;
    for (const x of chosen) {
      const alts = [...SYNONYMS.get(x.t)];
      out = out.slice(0, x.at) + alts[Math.floor(Math.random() * alts.length)] + out.slice(x.at + x.t.length);
    }
    set(out, `Swapped ${want} of ${wordsN} words for a synonym. Each swap gives that word and the next four tokens new previous tokens, so their round assignments are redrawn at random.`);
  }
  function invisible() {
    let n = 0;
    const out = area.value.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (w) => (++n % 4 === 0 ? w + '​' : w));
    set(out, `Added ${Math.floor(n / 4)} zero-width spaces, one after every fourth word. You can’t see them, but each is a token, so every set of four previous tokens now contains one. Untick “remove invisible characters” to see what a checker that doesn’t clean the text would make of it.`);
  }
  function emoji() {
    const g = generate({ junk: '🙂' });
    const preview = g.raw.split(/\s+/).slice(0, 9).join(' ');
    set(g.text, [h('b', null, 'What Claude wrote: '), preview + ' … ', h('b', null, 'After you delete the faces: '), 'the letter above. Every word was picked with a face among its four previous tokens. With the faces gone, the checker sees different previous tokens everywhere.'], g.text);
    refGrams = ngrams(g.raw);
    render();
  }

  area.addEventListener('input', () => {
    status.textContent = 'Your edits. Each changed token redraws its own round assignments and those of the next four tokens.';
    render();
  });
  const stripBox = h('input', { type: 'checkbox', checked: true, onchange: (e) => { strip = e.target.checked; render(); } });

  // Each edit button works once and stays lit, so the row reads as a record of what was done to
  // the letter; Reset puts the letter back and unlights them.
  const used = [];
  const once = (label, fn) => {
    const b = btn(label, () => {
      if (b.disabled) return;
      b.disabled = true;
      b.classList.add('used');
      b.setAttribute('aria-pressed', 'true');
      fn();
    });
    used.push(b);
    return b;
  };
  const reset = () => {
    for (const b of used) {
      b.disabled = false;
      b.classList.remove('used');
      b.removeAttribute('aria-pressed');
    }
    set(LETTER_CLAUDE, 'Back to Claude’s original letter.', LETTER_CLAUDE);
  };

  root.append(
    h('div', { class: 'sid-eyebrow' }, 'Demo 4 · edit it, or try to remove it'),
    lede('Claude’s letter again. Type into it, or press a button, and the checker below updates. A wavy underline marks a word whose four previous tokens changed: the checker now gives it new, random round assignments, so its evidence is gone.'),
    area,
    h('div', { class: 'sid-sub' }, 'Or let something else do the editing'),
    h('div', { class: 'sid-row sid-controls' },
      once('Swap 1 word in 10 for a synonym', () => swap(0.1)),
      once('Swap 1 word in 4', () => swap(0.25)),
      once('Add an invisible character every 4 words', invisible),
      once('Ask Claude to reword it', () => {
        const t = generate().text;
        set(t, 'Claude reworded the whole letter. It’s new text from the same model with the same key, so it carries a new watermark of its own.', t);
      }),
      once('Reword it with a model that doesn’t have the key', () => set(generate({ watermark: false }).text, 'A model without the key reworded the letter. Every word was picked with ordinary randomness, so there is nothing for the checker to find.')),
      once('The emoji trick', emoji),
      once('Keep only the first 40 words', () => {
        let n = 0;
        let cut = area.value.length;
        for (const m of area.value.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu)) if (++n === 40) { cut = m.index + m[0].length; break; }
        set(area.value.slice(0, cut), 'The same watermarked words, just fewer of them. Each word carries the same evidence as before; there’s less of it.');
      }),
      btn('Reset', reset)),
    h('label', { class: 'sid-check' }, stripBox, ' Checker removes invisible characters before checking'),
    status,
    legend(true),
    view.el,
    h('p', { class: 'sid-note' }, kept),
    info,
    panel.el,
    h('p', { class: 'sid-caption' }, 'The rewording buttons write a new letter from the same menu of word choices: a stand-in for a real paraphrase, which would change more than single words.'),
  );
  render();
  status.textContent = 'Claude’s letter, untouched.';
  return {};
}
