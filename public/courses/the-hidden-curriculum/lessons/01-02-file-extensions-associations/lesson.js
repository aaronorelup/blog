/* 01.02 File extensions & associations: metadata only; scenes live in scenes/NN.js */
LESSON({
  id: '01.02',
  title: 'File extensions & associations',
  short: 'File extensions',
  module: 'Your Computer, Under the Hood',
  summary: 'The extension is a label in a file\'s name and your computer keeps a ledger matching each label to a program, so renaming changes the label but never the bytes, while Open with set to Always and default apps edit the ledger; this lesson draws that picture as of October 2026, with AI tools now making the files.',
  keep: [
    ['The extension is a label in the name.', 'Your file manager reads only the part after the last dot, and Windows and Mac still hide it by default.'],
    ['Your computer keeps a ledger from label to program.', 'That ledger is the file associations: one per user, and installers, updates and, for some rows, only you may write in it.'],
    ['Renaming changes the label; Open with\'s Always and default apps change the ledger.', 'Renaming .txt to .py moves no bytes and converts nothing; "Always" and default apps rewrite the row.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '14'],
});
