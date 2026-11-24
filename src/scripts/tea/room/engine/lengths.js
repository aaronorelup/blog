// How long each chapter of the tea room is, in viewport heights (pure). A chapter declares base + per x n for
// each composition, and n comes from the picks, so every length is known before the first layout and nothing
// on the page moves when it is measured. The build (RoomChapter) and the engine both use these.

// The head is where a chapter's first paper may begin, the tail what its last paper leaves clear, in vh.
export const HEAD = 1.2;
export const HEAD_AFTER_HERO = 1.0; // the chapter after the hero is entered through the door, not the screens
export const TAIL = 0.6;
export const TAIL_LAST = 1.6; // the last chapter closes the house: one screen more
export const AFTER_HERO = HEAD - HEAD_AFTER_HERO;
export const LAST_EXTRA = TAIL_LAST - TAIL;

// How many items a chapter shows in one composition, from its shelves as the resolver gives them
// ([{ id, rows }]). rule: { shelves: ids counted (default every shelf), pair: ids shown two to a screen,
// pairing inside a shelf and never across two }. A shelf missing from the chapter counts 0.
export function itemCount(shelves, rule = {}) {
  const counted = rule.shelves ?? shelves.map((s) => s.id);
  const pair = rule.pair ?? [];
  return shelves.filter((s) => counted.includes(s.id))
    .reduce((n, s) => n + (pair.includes(s.id) ? Math.ceil(s.rows.length / 2) : s.rows.length), 0);
}

// A chapter's scroll length in vh: base + per x n, less the head it does not need after the hero, and one screen
// more when it is the last chapter. [base, per] for the composition in use.
export function chapterLength([base, per], n, { afterHero = false, last = false } = {}) {
  return base + per * n - (afterHero ? AFTER_HERO : 0) + (last ? LAST_EXTRA : 0);
}

// Where a chapter's paper may lie, in vh into its section: from its head to its length less its tail. The hero
// has neither: its slip is part of the first frame and it ends at the door, not at the screens.
export function paperSpan(len, { hero = false, afterHero = false, last = false } = {}) {
  if (hero) return null;
  return [afterHero ? HEAD_AFTER_HERO : HEAD, len - (last ? TAIL_LAST : TAIL)];
}

// Every chapter's place and length for chapters [{ id, len: { d: [base, per], p }, n: { d, p } }] in page order:
// [{ id, top, len }] in vh from the top of the first section, and the total.
export function pageLengths(chapters, comp) {
  let top = 0;
  const out = chapters.map((c, i) => {
    const len = chapterLength(c.len[comp], c.n[comp], {
      afterHero: i === 1 && chapters[0].id === 'hero', last: i === chapters.length - 1,
    });
    const at = { id: c.id, top, len };
    top += len;
    return at;
  });
  return { chapters: out, total: top };
}
