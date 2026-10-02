/* 00.05 How LLMs work (just enough): metadata only; scenes live in scenes/NN.js. */
LESSON({
  id: '00.05',
  title: 'How LLMs work (just enough)',
  short: 'How LLMs work',
  module: 'Orientation',
  summary: 'A large language model cuts your text into tokens and guesses the next one, one at a time, from only what fits on its desk (the context window), so it is trained to sound right, not to be right: put the facts on the desk and check the specifics.',
  keep: [
    ['It guesses the next token, over and over.', 'Text is cut into pieces, not letters, and limits and prices count them; temperature sets how adventurous each pick is.'],
    ['It only sees its desk: the context window.', 'The whole conversation is re-sent every turn, and the oldest parts fall off when the desk fills.'],
    ['Sounding right isn\'t being right.', 'A confident wrong guess is a hallucination: put the facts on the desk, ask for sources, and check every specific.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '09'],
});
