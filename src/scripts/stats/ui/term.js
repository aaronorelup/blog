// Words a newcomer might not know, made into quiet buttons: dotted underline, same font and
// colour as the sentence, and a definition card on hover, tap or Enter. A kind word ("People",
// "Named bots") also carries its glyph and lights up its pile in the hero while it is pointed at
// (the `brush` event), and is underlined when the pile is pointed at in turn.
import { TERMS, KINDS } from '../core/words.js';
import { utcMidnightLocal } from '../core/fmt.js';
import { bindPop, cardBody } from './pop.js';
import { glyphSVG } from './glyph.js';

let defaultBus = null;
/** main.js hands over the page's bus once, so sentences can make kind words without carrying it. */
export function setDefaultBus(bus) { defaultBus = bus; }

// A span with the button role rather than a <button>: a button is laid out as one unbreakable
// box, so a five-word term had to move whole to the next line and left the line before it
// short. A span wraps like the words around it. Enter and Space click it, as they would a button
// (a keyboard click has detail 0, which ui/pop.js reads as "open the card, focus inside").
function makeButton(label, cls) {
  const b = document.createElement('span');
  b.className = cls;
  b.setAttribute('role', 'button');
  b.tabIndex = 0;
  const span = document.createElement('span');
  span.className = 'st-term-text';
  span.textContent = label;
  b.append(span);
  b.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      b.click();
    }
  });
  return b;
}

/** A defined word. key is a words.TERMS key; label defaults to the term's own word. */
export function term(key, label) {
  const t = TERMS[key] || { word: label || key, def: '' };
  const b = makeButton(label || t.word, 'st-term');
  b.dataset.term = key;
  bindPop(b, () => cardBody({
    title: t.word[0].toUpperCase() + t.word.slice(1),
    body: typeof t.def === 'function' ? t.def({ utcMidnight: utcMidnightLocal() }) : t.def,
  }), { label: 'What "' + t.word + '" means' });
  return b;
}

/** A kind word: glyph + word, its definition card, and two-way brushing with the hero's pile. */
export function kindWord(kind, label, bus = defaultBus) {
  const k = KINDS[kind];
  const word = label || k?.short || kind;
  const b = makeButton(word, 'st-term st-kindword');
  b.dataset.kind = kind;
  // the glyph and the first word never part at a line end; the rest of the term wraps freely
  const text = b.firstChild;
  const sp = word.indexOf(' ');
  const lead = document.createElement('span');
  lead.className = 'st-term-lead';
  lead.append(glyphSVG(kind, { size: '0.8em' }), sp > 0 ? word.slice(0, sp) : word);
  text.replaceChildren(lead, sp > 0 ? word.slice(sp) : '');
  const lit = (on) => bus?.emit('brush', { kind: on ? kind : null, from: 'term' });
  if (k) {
    // when the card closes (tap, Escape, scroll), the pile it lit goes back to normal
    bindPop(b, () => cardBody({ title: k.long, body: k.def }), { label: 'What "' + k.long + '" means', onClose: () => lit(false) });
  }
  if (bus) {
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') lit(true); });
    b.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') lit(false); });
    b.addEventListener('focus', () => lit(true));
    b.addEventListener('blur', () => lit(false));
    // a tap lights the pile for as long as the card is open
    b.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') lit(true); });
    let seen = false;
    const off = bus.on('brush', (d) => {
      if (!b.isConnected) { if (seen) off(); return; }
      seen = true;
      if (d.from === 'pile') b.classList.toggle('is-lit', d.kind === kind);
    });
  }
  return b;
}
