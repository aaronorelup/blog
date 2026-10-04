/* 01.01 Files are just bytes: metadata only; scenes live in scenes/NN.js */
LESSON({
  id: '01.01',
  title: 'Files are just bytes',
  short: 'Files are bytes',
  module: 'Your Computer, Under the Hood',
  summary: 'Every file is just a row of numbers called bytes, and the extension is a label on its name that picks which program opens it, not what is inside; this lesson draws that picture so nothing an agent does with your files surprises you.',
  keep: [
    ['A file is just bytes.', 'A string of numbers, each from 0 to 255, with a name tag tied on.'],
    ['Text is bytes plus an agreement.', 'A code card maps numbers to letters, and today it is almost always UTF-8.'],
    ['The extension is a label that picks the program, not the contents.', 'Renaming .txt to .py changes zero bytes; only what opens it on a double-click.'],
  ],
  images: { plate: '../../engine/assets/teahouse-night.jpg' },
  noBadge: ['01', '08'],
});
