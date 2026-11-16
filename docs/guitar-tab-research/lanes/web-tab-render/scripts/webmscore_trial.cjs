// webmscore 1.2.1 (MuseScore 3 engine compiled to WebAssembly) under plain Node: load a Guitar Pro or MusicXML file,
// read its metadata, save MusicXML, MIDI, SVG (page 1), PNG (page 1), PDF and .mscz.
// Usage: node webmscore_trial.cjs <input> <format: gp5|gp|musicxml|...> <out prefix> [--shim-navigator] [--no-fetch]
const fs = require('fs');
// Node 21+ defines globalThis.navigator as a getter; webmscore 1.2.1's Node shim assigns to it and throws
// "Cannot set property navigator of #<Object> which has only a getter". With --shim-navigator the property is
// replaced by a plain writable one before webmscore is loaded.
if (process.argv.includes('--shim-navigator')) {
  Object.defineProperty(globalThis, 'navigator', { value: {}, writable: true, configurable: true });
}
// Node 18+ has a global fetch(); webmscore's Emscripten loader then fetches the .wasm by file path and fails with
// "Failed to parse URL from .../webmscore.lib.wasm". With --no-fetch, fetch is removed so it reads the file instead.
if (process.argv.includes('--no-fetch')) {
  delete globalThis.fetch;
}
const WebMscore = require('/home/user/gtr/lanes/web-tab-render/web/node_modules/webmscore');
(async () => {
  const [, , inFile, fmt, outPrefix] = process.argv;
  const t0 = Date.now();
  const W = WebMscore.default || WebMscore;
  await W.ready;
  const tReady = Date.now() - t0;
  const res = { input: inFile, format: fmt, ms_ready: tReady };
  let score;
  try {
    score = await W.load(fmt, new Uint8Array(fs.readFileSync(inFile)), [], false);
  } catch (e) {
    res.loadError = String(e && e.message || e);
    console.log(JSON.stringify(res));
    fs.writeFileSync(outPrefix + '.json', JSON.stringify(res, null, 1));
    process.exit(1);
  }
  res.ms_load = Date.now() - t0 - tReady;
  try { res.metadata = await score.metadata(); } catch (e) { res.metadataError = String(e); }
  const save = async (name, fn, ext, enc) => {
    const t1 = Date.now();
    try {
      const data = await fn();
      const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.from(data);
      fs.writeFileSync(outPrefix + ext, buf);
      res[name] = { bytes: buf.length, ms: Date.now() - t1 };
    } catch (e) { res[name] = { error: String(e && e.message || e).slice(0, 300) }; }
  };
  await save('musicxml', () => score.saveXml(), '.musicxml');
  await save('midi', () => score.saveMidi(true, true), '.mid');
  await save('svg_p1', () => score.saveSvg(0, true), '.p1.svg');
  await save('png_p1', () => score.savePng(0, true, false), '.p1.png');
  await save('pdf', () => score.savePdf(), '.pdf');
  await save('mscz', () => score.saveMsc('mscz'), '.mscz');
  score.destroy();
  res.ms_total = Date.now() - t0;
  if (res.metadata) {
    const m = res.metadata;
    res.metadata_summary = { title: m.title, measures: m.measures, duration: m.duration, parts: (m.parts || []).map((p) => ({ name: p.name, instrumentId: p.instrumentId, program: p.program })), excerpts: (m.excerpts || []).length };
    delete res.metadata;
  }
  fs.writeFileSync(outPrefix + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  process.exit(0);
})();
