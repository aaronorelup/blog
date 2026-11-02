// RAG Goobie's box (components/ledger/SearchBox.astro, scripts/search/examples.js): the example questions its
// placeholder cycles through while Ask is open (each checked to get a good answer, G8 in docs/ASK.md, and at most
// 44 characters so it fits a 360 px phone), how long each shows, and the post whose card the "Ask RAG Goobie" button
// shows once it is listed (PREVIEWS.md).
export const ABOUT_POST = 'how-rag-goobie-works';
export const CYCLE_MS = 4000;
export const EXAMPLES = [
  'Is renting a cloud GPU worth it?',
  'How did Aaron train a LoRA of his character?',
  'Can Claude mod a game I own?',
  'How are long AI films made on 8 GB?',
  'Who actually visits a brand-new website?',
  'Did the AI writers catch the planted lie?',
  'Can AI rig a 3D character with a tail?',
  'How big a game can one prompt build?',
  'What stopped Aaron when he started coding?',
];
