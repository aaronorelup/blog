// alphaTab player trial in headless Chromium: start alphaSynth on a score, record every playback event with its
// page time, then (optionally) render the score offline with api.exportAudio() and write a WAV.
// Usage: node alphatab_player.cjs <page query> <out prefix> [--metronome 1] [--countin 1] [--speed 1.0]
//        [--transpose N] [--export-audio 1] [--play-seconds 33]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');

const args = process.argv.slice(2);
const qs = args[0];
const outPrefix = args[1];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const metronome = parseFloat(opt('metronome', '0'));
const countIn = parseFloat(opt('countin', '0'));
const speed = parseFloat(opt('speed', '1'));
const transpose = parseInt(opt('transpose', '0'), 10);
const exportAudio = opt('export-audio', '0') === '1';
const playSeconds = parseFloat(opt('play-seconds', '33'));

function wav(samples, sampleRate, channels) {
  // 32-bit float WAV
  const dataBytes = samples.length * 4;
  const b = Buffer.alloc(44 + dataBytes);
  b.write('RIFF', 0); b.writeUInt32LE(36 + dataBytes, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(channels, 22); b.writeUInt32LE(sampleRate, 24);
  b.writeUInt32LE(sampleRate * channels * 4, 28); b.writeUInt16LE(channels * 4, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) b.writeFloatLE(samples[i], 44 + i * 4);
  return b;
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage({ viewport: { width: 1240, height: 900 } });
  const consoleMsgs = [];
  page.on('console', (m) => consoleMsgs.push({ type: m.type(), text: m.text().slice(0, 300) }));
  page.on('pageerror', (e) => consoleMsgs.push({ type: 'pageerror', text: String(e).slice(0, 300) }));
  await page.goto('http://127.0.0.1:8765/pages/alphatab.html?player=1&' + qs, { waitUntil: 'load' });
  let ready = true;
  try { await page.waitForFunction('window.__playerReady === true && window.__rendered === true', null, { timeout: 60000 }); } catch (e) { ready = false; }
  const setup = await page.evaluate(async ({ metronome, countIn, speed, transpose }) => {
    const api = window.api;
    // NoteOn, NoteOff (both enum values, see trials.md) and the metronome ticks
    api.midiEventsPlayedFilter = [128, 144, 242];
    api.metronomeVolume = metronome;
    api.countInVolume = countIn;
    api.playbackSpeed = speed;
    if (transpose) api.changeTrackTranspositionPitch(api.score.tracks, transpose);
    let ctxState = null;
    try { ctxState = api.player && api.player.output && api.player.output._context ? api.player.output._context.state : null; } catch (e) { /* not exposed */ }
    const info = {
      playerState: api.playerState, isReadyForPlayback: api.isReadyForPlayback, endTime: api.endTime, endTick: api.endTick,
      metronomeVolume: api.metronomeVolume, countInVolume: api.countInVolume, playbackSpeed: api.playbackSpeed,
      actualPlayerMode: api.actualPlayerMode, outputMode: api.settings.player.outputMode, ctxState,
      AudioContext: typeof AudioContext, AudioWorkletNode: typeof AudioWorkletNode,
    };
    window.__log.push({ type: 'play_called', t_ms: +(performance.now() - window.__T0).toFixed(3) });
    info.playReturned = api.play();
    return info;
  }, { metronome, countIn, speed, transpose });
  // let it play, then stop
  try { await page.waitForFunction('window.__finished === true', null, { timeout: playSeconds * 1000 }); } catch (e) { /* timeout */ }
  const log = await page.evaluate(() => { window.api.stop(); return window.__log; });
  let audio = null;
  if (exportAudio) {
    audio = await page.evaluate(async () => {
      const api = window.api;
      const t0 = performance.now();
      const opts = new alphaTab.synth.AudioExportOptions();
      opts.sampleRate = 44100;
      opts.metronomeVolume = 0;
      opts.masterVolume = 1;
      const exporter = await api.exportAudio(opts);
      const parts = [];
      let n = 0, last = null;
      while (true) {
        const chunk = await exporter.render(500);
        if (!chunk) break;
        parts.push(Array.from(chunk.samples));
        n += chunk.samples.length;
        last = { currentTime: chunk.currentTime, endTime: chunk.endTime, currentTick: chunk.currentTick, endTick: chunk.endTick };
      }
      exporter.destroy();
      return { ms: performance.now() - t0, n, last, samples: parts.flat() };
    });
  }
  const out = { qs, ready, setup, consoleMsgs, log };
  if (audio) {
    // alphaSynth renders interleaved stereo float samples
    fs.writeFileSync(outPrefix + '.export.wav', wav(Float32Array.from(audio.samples), 44100, 2));
    out.audioExport = { ms: audio.ms, n_float_samples: audio.n, last: audio.last, file: outPrefix + '.export.wav' };
  }
  fs.writeFileSync(outPrefix + '.player.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify({ ready, setup, n_log: log.length, audioExport: out.audioExport || null, console: consoleMsgs.slice(0, 6) }));
  await browser.close();
})();
