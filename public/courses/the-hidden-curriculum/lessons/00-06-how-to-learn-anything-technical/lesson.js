/* 00.06 Trust what you can verify: metadata only; scenes live in scenes/NN.js. */
LESSON({
  id: '00.06',
  title: 'Trust what you can verify',
  short: 'What you can verify',
  module: 'Orientation',
  summary: 'You can only trust AI on what can actually be checked: agents now fix their own crashes, so your job is judging what they cannot see (security holes in code that works, team norms, dependencies, "ready to deploy"), and past that line you either learn to check it or bring in someone who can.',
  keep: [
    ['The agent fixes the crashes; you own what it can\'t see.', 'Errors a machine can check, it handles. Security, team fit, dependencies and "ready to ship" are judgment calls.'],
    ['"Yes, it\'s secure" is just another answer.', 'If you can\'t check it, either learn enough to check it or get someone who can.'],
    ['Someone has to own the rules and the supplier list.', 'Write the team\'s norms down for the agent, and let a person who knows the libraries approve every new dependency.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '16'],
});
