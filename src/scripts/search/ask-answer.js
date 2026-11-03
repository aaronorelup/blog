// RAG Goobie's answer as the page draws it, always as text: the words typing in as they stream (re-cited at most once
// a frame), the final answer with its cites, the fine print, and the posts under it; or a note in place of all that.
// cited() and passage() are T2.2c's: a reader counts posts, so each [n] shows its post's place among those cited, and
// each link goes to its own passage with the question's words marked.
import { ABOUT_POST } from '../../data/ask.js';
import { deepLink, h, pagePath, relatedRow } from './results.js';

export const SAY = {
  resting: 'RAG Goobie is resting. These posts are closest.',
  off: 'RAG Goobie is resting.',
  fine: "RAG Goobie answers from Aaron's posts only and can be wrong.",
  unsolved: 'The check that this is a person didn’t finish. Try again in a minute.',
  expired: 'That session ran out. Ask again.',
  busy: 'RAG Goobie has had a lot of questions this minute. Try again shortly.',
  down: 'RAG Goobie can’t answer right now. Try again in a minute.',
};
export const say = (text) => h('p', { class: 'ask-note' }, text);

// Where a cite lands, in words: its heading, the post's opening or its short version, and on a notes page, that it is
// the full making-of. The hover card shows it after "RAG Goobie cites:", a screen reader after the post's title.
function passage({ kind, anchor, heading }) {
  const where = anchor === 'short' ? 'the short version' : heading || 'the opening';
  if (kind !== 'notes') return where;
  return where === 'the opening' ? 'the opening of the full making-of' : `${where}, in the full making-of`;
}

// RAG Goobie's [n] number passages; a reader counts posts. Each [n] shows its post's place among the posts cited, in
// order of first mention (1, 2, 3, no gaps), and a run of them (only spaces between) shows each post once, as its
// first passage there. Every link still goes to its own passage, on the post or its notes page, with the question's
// words marked.
function cited(text, cites, q, cards) {
  const byN = new Map(cites.map((c) => [`[${c.n}]`, c]));
  const posts = [];       // slugs in order of first mention
  const out = [];
  let run = new Set();    // the posts linked since the last words
  text.split(/(\[\d+\])/).forEach((part, i) => {
    const c = i % 2 ? byN.get(part) : null;
    if (!c) {
      if (part.trim()) run = new Set();
      out.push(part);
      return;
    }
    if (run.has(c.slug)) {
      while (typeof out.at(-1) === 'string') out.pop();   // the spaces since the last link
      return;
    }
    if (!posts.includes(c.slug)) posts.push(c.slug);
    const n = posts.indexOf(c.slug) + 1;
    const where = passage(c);
    run.add(c.slug);
    out.push(h('a', {
      class: 'ask-cite', href: deepLink(pagePath(c.slug, c.kind), c.anchor, q),
      'aria-label': `Source ${n}: ${cards[c.slug]?.title ?? c.title}, ${where}`,
      'data-card-line': `RAG Goobie cites: ${where}`,
    }, `[${n}]`));
  });
  return out;
}

const rows = (related, cards) => {
  const list = related.filter((slug) => cards[slug]).map((slug) => relatedRow(slug, cards[slug]));
  return list.length ? [h('ol', { class: 'rows ask-related', 'aria-label': 'Posts on this' }, ...list)] : [];
};

// Bring el's children to parts (cited()'s strings and links) without replacing a node that is already right: a run
// of text that grew changes in place, a cite link drawn before stays the same link. The words are redrawn every frame
// while they type in, and a link replaced between a press and its release gets no click (on WebKit, neither does a
// tap on text replaced so).
function patch(el, parts) {
  parts.forEach((p, i) => {
    const have = el.childNodes[i];
    if (typeof p === 'string') {
      if (have?.nodeType === Node.TEXT_NODE) { if (have.data !== p) have.data = p; }
      else if (have) have.replaceWith(p); else el.append(p);
    } else if (!have) el.append(p);
    else if (!have.isEqualNode(p)) have.replaceWith(p);
  });
  while (el.childNodes.length > parts.length) el.lastChild.remove();
}

// The answer as it streams: text(d) and cite(c) as the events come, then done() with the 'answer' event, or ended()
// with an 'end' one. el is the paragraph the words type into; after() the parts that follow the answer.
export function answer(q, cards) {
  const el = h('p', { class: 'ask-text' });
  const cites = [];
  let text = '';
  let frame = 0;
  const draw = () => { frame = 0; patch(el, cited(text, cites, q, cards)); };
  return {
    el,
    cite: (c) => cites.push(c),
    text: (d) => { text += d; frame ||= requestAnimationFrame(draw); },
    done: (a, summary) => {
      cancelAnimationFrame(frame);
      patch(el, cited(a.answer, a.cites, q, cards));
      const about = cards[ABOUT_POST] ? [' ', h('a', { class: 'ask-about', href: pagePath(ABOUT_POST) }, 'How RAG Goobie works')] : [];
      return [el, h('p', { class: 'ask-fine' }, SAY.fine, ...about), summary, ...rows(a.related, cards)];
    },
    ended: ({ reason, related }) => {
      cancelAnimationFrame(frame);
      return [say(reason === 'off' ? SAY.off : reason === 'resting' ? SAY.resting : SAY.busy), ...rows(related, cards)];
    },
  };
}
