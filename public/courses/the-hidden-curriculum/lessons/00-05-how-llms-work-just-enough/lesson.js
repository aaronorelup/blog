/* 00.05 How AI models work today: metadata only; scenes live in scenes/NN.js. */
LESSON({
  id: '00.05',
  title: 'How AI models work today',
  short: 'How AI works today',
  module: 'Orientation',
  summary: 'Underneath it all is still a model that only knows what is on its desk right now; nearly everything new in the last five years (multimodal hand-offs, diffusion, memory and RAG, instruction files, caching, modes, plugins, plans and always-on agents) is about what gets put on that desk, what it hands off to other models, and where the desk sits.',
  keep: [
    ['The model only knows what\'s on its desk right now.', 'Memory and instruction files are text put back on the desk, and a fuller desk is a worse desk.'],
    ['Making pictures is mostly a hand-off.', 'It reads many kinds of input, but pictures, video and music usually come from a separate model, most often diffusion.'],
    ['Same model, many rooms, four meters.', 'Where you meet it changes what it can touch and what it costs, and a warm cache makes repeats cheap.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '20'],
});
