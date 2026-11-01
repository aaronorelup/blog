// Aaron's two answers of 2026-11-01 (D1 ask_cache), word for word, as POST /api/ask returns them, the first with a
// cite of another post (a run with a space in it), a run that goes back to the first post and one cite of a notes page
// added: [4][5], [4], [5] and [1] are all passages of one post. `reads` is the answer as the page shows it, `links` each
// cite as [label, slug, notes/, anchor, passage]. Read by search-15 and cards.spec.mjs.
export const ANSWERS = [{
  answer: "Aaron's post on long AI films is closest. MiniMax-H3 makes six seconds a go [4][5]. Saved latents chain clips [4]. " +
    'Films ran 13 minutes [5]. Free memory before every clip [1]. A script folded the paper puppet [7] [2]. ' +
    'Both lean on code [4] [2][1]. Only a screenshot caught the black cards [9].',
  cites: [
    { n: 1, slug: 'every-ai-film-so-far', kind: 'post', anchor: 'what-held-across-all-of-it', heading: 'What held across all of it', title: 'Making long AI films' },
    { n: 2, slug: 'paper-jefrie', kind: 'post', anchor: '', heading: '', title: 'Paper' },
    { n: 4, slug: 'every-ai-film-so-far', kind: 'post', anchor: 'how-the-chaining-works', heading: 'How the chaining works', title: 'Making long AI films' },
    { n: 5, slug: 'every-ai-film-so-far', kind: 'post', anchor: '', heading: '', title: 'Making long AI films' },
    { n: 7, slug: 'paper-jefrie', kind: 'post', anchor: 'where-the-idea-came-from', heading: 'Where the idea came from', title: 'Paper' },
    { n: 9, slug: 'characters-in-inscryption', kind: 'notes', anchor: 'how-to-play-it', heading: 'How to play it', title: 'My characters in Inscryption: the making-of notes' }],
  related: ['every-ai-film-so-far', 'paper-jefrie', 'ai-rigging-vs-a-script'], cached: true,
  reads: "Aaron's post on long AI films is closest. MiniMax-H3 makes six seconds a go [1]. Saved latents chain clips [1]. " +
    'Films ran 13 minutes [1]. Free memory before every clip [1]. A script folded the paper puppet [2]. ' +
    'Both lean on code [1] [2]. Only a screenshot caught the black cards [3].',
  links: [
    ['[1]', 'every-ai-film-so-far', '', 'how-the-chaining-works', 'How the chaining works'],
    ['[1]', 'every-ai-film-so-far', '', 'how-the-chaining-works', 'How the chaining works'],
    ['[1]', 'every-ai-film-so-far', '', '', 'the opening'],
    ['[1]', 'every-ai-film-so-far', '', 'what-held-across-all-of-it', 'What held across all of it'],
    ['[2]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
    ['[1]', 'every-ai-film-so-far', '', 'how-the-chaining-works', 'How the chaining works'],
    ['[2]', 'paper-jefrie', '', '', 'the opening'],
    ['[3]', 'characters-in-inscryption', 'notes/', 'how-to-play-it', 'How to play it, in the full making-of']],
}, {
  answer: 'Closest is the paper Jefrie post [4]. Rigging tools lost to a script [5]. Start with [4] then [5].',
  cites: [
    { n: 4, slug: 'paper-jefrie', kind: 'post', anchor: 'where-the-idea-came-from', heading: 'Where the idea came from', title: 'Paper' },
    { n: 5, slug: 'ai-rigging-vs-a-script', kind: 'post', anchor: '', heading: '', title: 'Rigging' }],
  related: ['paper-jefrie', 'ai-rigging-vs-a-script', 'every-ai-film-so-far'], cached: true,
  reads: 'Closest is the paper Jefrie post [1]. Rigging tools lost to a script [2]. Start with [1] then [2].',
  links: [
    ['[1]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
    ['[2]', 'ai-rigging-vs-a-script', '', '', 'the opening'],
    ['[1]', 'paper-jefrie', '', 'where-the-idea-came-from', 'Where the idea came from'],
    ['[2]', 'ai-rigging-vs-a-script', '', '', 'the opening']],
}];
