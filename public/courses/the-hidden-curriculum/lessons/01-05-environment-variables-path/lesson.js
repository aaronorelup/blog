LESSON({
  id: '01.05',
  title: 'Environment variables & PATH',
  short: 'Env vars & PATH',
  module: 'Your Computer, Under the Hood',
  summary: 'Every program starts with a copy of its parent\'s settings, its environment, and PATH in it is an ordered list of folders where the first match wins, so which program runs and which keys it can see depend on who started it and when.',
  keep: [
    ['Every program carries a copy of its parent\'s environment.', 'Changes at home reach only programs started afterwards: open a new terminal.'],
    ['PATH is an ordered list, and the first match wins.', 'To know which program ran, ask the shell.'],
    ['Keys in the environment go wherever you send programs.', 'Agents included: know where yours live and who can read them.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '16'],
});
