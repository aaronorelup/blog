/* 01.03 · 02 Where it lives. The course map fills the safe area; the pin drops on module 01 (The Machine).
   Local times: pin-drop 0 s; path-role ~11.8 s ("every file has an address"); the word "path" ~17.5 s
   (the pill changes to "a path is that line of text"). Frame 0 is the full map with no focus, so it
   hands over calmly from the title-card map of 01. */
SCENE('02', (t, S) => {
  const M = window.M;
  K.bg();

  const pd = S.cue('pin-drop', 0);
  const pr = S.cue('path-role', 11.77);
  const pw = S.find('path', 0, pr + 5.7);

  // the district eases into focus: the other five dim, the Machine card gains its gold glow
  const focusK = K.io(t, pd, 0.8, 'io');
  // the you-are-here pin falls onto module 01 (map.js clamps pinDrop, so it lands with an ease, no overshoot)
  const pinDrop = K.io(t, pd, 0.7, 'out');
  const pinK = K.io(t, pd, 0.25, 'io');

  K.map.draw(t, {
    focus: 'machine',
    focusK,
    dim: 0.75,
    highlight: { machine: focusK },
    pin: '01',
    pinDrop,
    pinK,
    pinGlowK: focusK,
  });

  // small eyebrow, top right: sits clear of the lantern string and its labels (which run left)
  M.eyebrow('District 1 · The Machine', 1670, 240, { align: 'right', alpha: K.io(t, pd, 0.5, 'io') });

  // the path line: "every file has an address", then "a path is that line of text"
  const a1 = K.io(t, pr, 0.5, 'io') * (1 - K.io(t, pw, 0.4, 'io'));
  const a2 = K.io(t, pw, 0.4, 'io');
  if (a1 > 0.002) M.pill('every file has an address', 960, 880, { size: 30, lit: true, alpha: a1 });
  if (a2 > 0.002) M.pill('a path is that line of text', 960, 880, { size: 30, lit: true, alpha: a2 });
});
