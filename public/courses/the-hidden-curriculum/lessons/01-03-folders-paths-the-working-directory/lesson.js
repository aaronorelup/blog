LESSON({
  id: '01.03',
  title: 'Folders, paths & the working directory',
  short: 'Paths',
  module: 'Your Computer, Under the Hood',
  summary: 'A path is an address, and a relative path only makes sense from the working directory of the program that reads it.',
  keep: [
    ['A path is an address.', 'An absolute path starts at the root. A relative path starts where the program stands.'],
    ['Every running program has a working directory.', 'It is inherited from whatever started the program, and a cd moves only the session that ran it.'],
    ['The same name can mean a different file.', 'When something is not found, check the folder the program is in. With an agent, check which project it is in too.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '13'],
});
