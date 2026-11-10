// Does alphaTab's transposition change the sound? Render S2n.gp5 offline with api.exportAudio() three ways and write
// a WAV each: (a) plain; (b) after api.changeTrackTranspositionPitch(tracks, 2); (c) plain player but with
// AudioExportOptions.trackTranspositionPitches = {track 0: 2}. The pitch is then measured in Python
// (scripts/wav_peak_hz.py) on the first note (2.14 to 2.60 s: G2 bass + G3 melody in the score).
// Usage: node alphatab_transpose_export.cjs <out prefix>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
function wav(samples, sampleRate, channels) {
  const b = Buffer.alloc(44 + samples.length * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 4, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(channels, 22); b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * channels * 4, 28); b.writeUInt16LE(channels * 4, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 4, 40);
  for (let i = 0; i < samples.length; i++) b.writeFloatLE(samples[i], 44 + i * 4);
  return b;
}
(async () => {
  const out = process.argv[2];
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = {};
  for (const mode of ['plain', 'changeTrackTranspositionPitch', 'exportOption']) {
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8765/pages/alphatab.html?player=1&file=/inputs/S2n/S2n.gp5', { waitUntil: 'load' });
    await page.waitForFunction('window.__playerReady === true && window.__rendered === true', null, { timeout: 60000 });
    const r = await page.evaluate(async (mode) => {
      const api = window.api;
      if (mode === 'changeTrackTranspositionPitch') api.changeTrackTranspositionPitch(api.score.tracks, 2);
      const opts = new alphaTab.synth.AudioExportOptions();
      opts.sampleRate = 44100; opts.metronomeVolume = 0; opts.masterVolume = 1;
      if (mode === 'exportOption') opts.trackTranspositionPitches = new Map([[0, 2]]);
      const exp = await api.exportAudio(opts);
      const parts = [];
      // only the first 4 seconds are needed
      for (let i = 0; i < 8; i++) { const c = await exp.render(500); if (!c) break; parts.push(Array.from(c.samples)); }
      exp.destroy();
      return parts.flat();
    }, mode);
    fs.writeFileSync(`${out}.${mode}.wav`, wav(Float32Array.from(r), 44100, 2));
    results[mode] = { floats: r.length };
    await page.close();
  }
  console.log(JSON.stringify(results));
  await browser.close();
})();
