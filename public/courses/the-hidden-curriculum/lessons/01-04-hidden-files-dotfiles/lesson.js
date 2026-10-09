LESSON({
  id: '01.04',
  title: 'Hidden files & dotfiles',
  short: 'Hidden files',
  module: 'Your Computer, Under the Hood',
  summary: 'Almost every project and app keeps its settings, history, secrets and now its AI instructions in files your computer hides or tucks out of the way, and hidden only means out of sight, never locked.',
  keep: [
    ['Hidden means out of sight, not locked.', 'A dot on Mac and Linux, a flag on Windows; any program, agent or piece of malware can still read it.'],
    ['Your secrets live in the hidden layer.', '.env is plain text: never commit it, never paste it, and replace a key that leaked.'],
    ['Agents read and write this layer.', 'After an agent works, check what changed, hidden files included.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '15'],
});
