// Reciprocal rank fusion of the two halves, per page (a post, or its notes): each half adds 1 / (60 + rank) for
// every page it ranks. The pages the words half found come first, in fused order (one the meaning half found too
// rises among them), then the pages only the meaning half found; a page keeps one passage, the words half's excerpt
// when both halves found it.
const K = 60;

export function merge(words, meaning) {
  const pages = new Map();
  for (const [half, hits] of [['words', words], ['meaning', meaning]]) {
    let rank = 0;
    for (const hit of hits) {
      const page = pages.get(hit.path) ?? { score: 0 };
      if (page[half]) continue;   // the page's second chunk: its first already ranked it
      rank += 1;
      page.score += 1 / (K + rank);
      page[half] = hit;
      pages.set(hit.path, page);
    }
  }
  return [...pages.values()].sort((a, b) => !a.words - !b.words || b.score - a.score).map((p) => p.words ?? p.meaning);
}
