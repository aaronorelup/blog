// A post's Markdown down to the words a reader reads, and its reading minutes: /ledger/previews.json's card and the
// ledger row show the same number. Component markup carries a lot of attribute text that nobody reads, so tags go
// entirely. T2.1 moves the minutes onto the extraction's text.words.
const WORDS_PER_MINUTE = 230;

export function plain(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, ' ');
}

// A chart's data table, a raw <pre> or a whole <ao-series> is looked at, not read word by word;
// counted as prose, AO-057's 77 rows of numbers made a nine-minute post read as eighteen.
export function readingMinutes(body) {
  const prose = body.replace(/<(table|pre|ao-series)\b[\s\S]*?<\/\1>/gi, ' ');
  const words = plain(prose).split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
