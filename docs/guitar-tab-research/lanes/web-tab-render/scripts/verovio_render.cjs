// Verovio (npm `verovio`, WASM) under plain Node: load a file (MEI, MusicXML, ABC, Humdrum ... detected by Verovio),
// render every page to SVG, export MEI, MIDI (base64 from the toolkit) and the timemap, and report what it read.
// Usage: node verovio_render.cjs <input> <out prefix> [optionsJSON]
const fs = require('fs');
const path = require('path');
(async () => {
  const [, , inFile, outPrefix, optJson] = process.argv;
  const t0 = Date.now();
  const createModule = (await import('/home/user/gtr/lanes/web-tab-render/web/node_modules/verovio/dist/verovio-module.mjs')).default;
  const { VerovioToolkit } = await import('/home/user/gtr/lanes/web-tab-render/web/node_modules/verovio/dist/verovio.mjs');
  const VerovioModule = await createModule();
  const tk = new VerovioToolkit(VerovioModule);
  const tInit = Date.now() - t0;
  const opts = Object.assign({ pageWidth: 2100, pageHeight: 2970, scale: 40, adjustPageHeight: true, footer: 'none' },
    optJson ? JSON.parse(optJson) : {});
  tk.setOptions(opts);
  const data = fs.readFileSync(inFile, 'utf8');
  const ok = tk.loadData(data);
  const tLoad = Date.now() - t0;
  const res = { version: tk.getVersion(), input: inFile, loadOk: ok, ms_init: tInit, log: tk.getLog().slice(0, 2000) };
  if (ok) {
    const pages = tk.getPageCount();
    res.pages = pages;
    for (let p = 1; p <= pages; p++) fs.writeFileSync(`${outPrefix}.p${p}.svg`, tk.renderToSVG(p));
    res.ms_render = Date.now() - t0 - tLoad;
    const mei = tk.getMEI({});
    fs.writeFileSync(outPrefix + '.export.mei', mei);
    try {
      const midi = tk.renderToMIDI();
      fs.writeFileSync(outPrefix + '.mid', Buffer.from(midi, 'base64'));
      res.midiBytes = Buffer.from(midi, 'base64').length;
    } catch (e) { res.midiError = String(e); }
    try {
      const tm = tk.renderToTimemap({});
      fs.writeFileSync(outPrefix + '.timemap.json', JSON.stringify(tm));
      res.timemapEntries = tm.length;
      res.timemapFirst = tm.slice(0, 4);
    } catch (e) { res.timemapError = String(e); }
    res.exportMei = { bytes: mei.length, tabGrp: (mei.match(/<tabGrp/g) || []).length,
      tabCourse: (mei.match(/tab\.course=/g) || []).length, notationtypeTab: /notationtype="tab/.test(mei),
      staffDefs: (mei.match(/<staffDef /g) || []).length };
  }
  res.ms_total = Date.now() - t0;
  fs.writeFileSync(outPrefix + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 1500));
})();
