// Every word the leaves room shows (src/pages/leaves/index.astro, src/scripts/leaves/). The number itself is never
// set in a font: the leaves draw it. Copy rules: WRITING.md (no em dashes, semicolons or exclamation marks).
export const LEAVES_PAGE = { title: 'The leaves · Aaron Orelup', description: 'A cup of tea, read.' };

export const COPY = {
  alt: (num) => `A cup of tea on a cedar tray. The leaves at the bottom read ${num}.`,
  hint: 'stir',
  leave: 'Leave the cup',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  list: 'The leaves in the cup',
  label: (id, title) => `${id} · ${title}`,
  wordLeaf: 'leaves · from the sentence',
  line1: (next) => `The leaves say ${next}. I haven't written it yet.`,
  // the green leaves in the cup are this month's (palette.js turns a leaf at 30 days), so the slip names them
  line2: ({ n, share, recent }) => `${n} entries in the pot, one leaf each.` + (
    recent === 0 ? ' None of them is from this month.'
      : recent === 1 ? " The green one is this month's."
        : ` The green ones are this month's ${recent}.` + (share > 0.5 ? ' They gave most of the color.' : '')),
};

// "AO-086" as the leaves write it: the digits only.
export const digitsOf = (id) => /(\d+)$/.exec(id)?.[1] ?? id;
