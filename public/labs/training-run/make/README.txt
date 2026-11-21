How the published run of "A training run you can hear" (the Fable 5.2 version) was made.
The post: https://aaronorelup.com/ledger/three-ai-experiments/

The trainer, the clock and the sound are the files one folder up: core.js, programme.js, synth.js.
They are the same files the page runs in your browser. These scripts only feed them and draw the results.

  1-parse-tunes.py   reads the 6/8 tunes of four old collections (ABC text inside the music21 library) onto an
                     eighth-note grid.                                    needs: pip install music21
  2-pick-tunes.py    keeps the major-key tunes that fit the grid, moves them to D, drops repeats, and holds 68 out.
                     Its output, without the titles, is ../tunes.json.
  3-run.mjs          runs the programme and writes every note and every training step to out/.     needs: Node 20+
  4-sound.mjs        turns a run into a WAV file. ffmpeg made the MP3s.
  5-pictures.mjs     draws the strip and the chart.                        needs: npm install sharp
  6-studies.mjs      the side studies: other pushes, other random seeds, inputs taken away, how new the music is.

In order:  python 1-parse-tunes.py <music21/corpus> out/raw_tunes.json
           python 2-pick-tunes.py out/raw_tunes.json out/tunes.json
           node 3-run.mjs main        (then alone, x3, x10)
           node 4-sound.mjs main
           node 5-pictures.mjs chart main

Every random number comes from a seeded generator, and exp, log and tanh are built from + - * / only, so a run
gives the same digits on any machine. ../published.json holds the published run's numbers at full precision.

The tunes: O'Neill's Music of Ireland (1903), Aird's Airs (about 1780 to 1800), Ryan's Mammoth Collection (1883)
and two small folk books. The music is long out of copyright. Volunteers typed it into ABC notation, among them
Jack Campin, John Chambers, Ray Davies and Dan G. Petersen, and their files ship with music21.
