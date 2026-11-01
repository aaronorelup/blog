// What WRITING.md bans, as data. scripts/check/prose.mjs reads PHRASES (any case, from a word start) in the text a
// reader sees; scripts/check/links.mjs reads LINKS in posts, notes and project files. Nothing here is private:
// private terms are hashed in never-publish.json.
export const PHRASES = [
  'it turns out', "here's the thing", 'in this post', 'incredible', 'game-changing', 'game changing',
  'seamless', 'unlock', 'leverage', 'powerful', 'delve', "let's dive", 'buckle up', 'spoiler:',
  'the short answer', 'you can skim', 'tl;dr',
];

export const LINKS = [
  { pattern: /ao2nOnefkps/, why: 'the deleted Episode 1 video (the live one is 7TusXDOgV4Y)' },
  { pattern: /github\.com\/bloodtailor\b/i, why: 'the old GitHub user name (it is github.com/aaronorelup now)' },
];
