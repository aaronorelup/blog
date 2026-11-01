// The words of a query or a question worth marking on a post: lower case, regex-safe, without the small words
// every sentence has. Search's semantic.js and results.js and Ask's citations read it.
const SMALL = new Set(('a an and are as at be but by can could did do does for from had has have how i if in into is ' +
  'it its me my of on or our so than that the their them then there they this to was we were what when where which ' +
  'who why will with would you your about aaron much many').split(' '));

export const termsOf = (q) => [...new Set(q.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])]
  .filter((w) => !SMALL.has(w));
