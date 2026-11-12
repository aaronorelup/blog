// Gap round 2 (web-tab-render): Verovio 6.4.1's editor API (toolkit.edit(editorAction), typings in
// dist/types/verovio-toolkit.d.ts and EditorTypes.d.ts) on MEI guitar tablature, under plain Node. Loads the MEI tab
// written from the S2n truth (samples/verovio/S2n.truth.mei), finds the first two melody notes of bar 1 by their
// xml:id in Verovio's own MEI, then applies "set" actions: note 1 tab.fret 0 -> 2; note 2 tab.course 3 -> 4 and
// tab.fret 0 -> 5; then "undo" once. After each step: the return value of edit(), editStatus(), the two notes'
// attributes in getMEI(), and the fret text Verovio draws for them in renderToSVG(1).
// Usage: node verovio_edit_tab.cjs <mei file> <out prefix>
const fs = require('fs');
(async () => {
  const [, , inFile, outPrefix] = process.argv;
  const createModule = (await import('/home/user/gtr/lanes/web-tab-render/web/node_modules/verovio/dist/verovio-module.mjs')).default;
  const { VerovioToolkit } = await import('/home/user/gtr/lanes/web-tab-render/web/node_modules/verovio/dist/verovio.mjs');
  const tk = new VerovioToolkit(await createModule());
  tk.setOptions({ pageWidth: 2100, pageHeight: 2970, scale: 40, adjustPageHeight: true, footer: 'none' });
  const res = { version: tk.getVersion(), input: inFile, loadOk: tk.loadData(fs.readFileSync(inFile, 'utf8')), steps: [] };
  const mei0 = tk.getMEI({});
  // the first two <note> elements of layer 1 in the second measure (bar 1 after the count-in bar)
  const m2 = mei0.split('<measure').slice(2, 3)[0];
  const layer1 = m2.split('<layer')[1];
  const ids = [...layer1.matchAll(/<note [^>]*xml:id="([^"]+)"/g)].slice(0, 2).map((m) => m[1]);
  res.note_ids = ids;
  const attrs = (mei, id) => {
    const m = new RegExp(`<note [^>]*xml:id="${id}"[^>]*>`).exec(mei);
    if (!m) return null;
    const g = (a) => { const x = new RegExp(`${a.replace('.', '\\.')}="([^"]*)"`).exec(m[0]); return x ? x[1] : null; };
    return { 'tab.course': g('tab.course'), 'tab.fret': g('tab.fret') };
  };
  const drawn = (svg, id) => { // the text Verovio drew inside the note's <g id="...">
    const i = svg.indexOf(`id="${id}"`);
    if (i < 0) return null;
    const seg = svg.slice(i, i + 1500);
    const t = /<text[^>]*>([\s\S]*?)<\/text>/.exec(seg);
    return t ? t[1].replace(/<[^>]+>/g, '').trim() : null;
  };
  const snap = (label, ok) => {
    const mei = tk.getMEI({});
    const svg = tk.renderToSVG(1);
    res.steps.push({ step: label, edit_returned: ok, status: (() => { try { return tk.editStatus(); } catch (e) { return String(e); } })(),
      note1: { mei: attrs(mei, ids[0]), drawn: drawn(svg, ids[0]) }, note2: { mei: attrs(mei, ids[1]), drawn: drawn(svg, ids[1]) } });
    return { mei, svg };
  };
  snap('loaded', null);
  snap('set note 1 tab.fret 2', tk.edit({ action: 'set', param: { elementId: ids[0], attribute: 'tab.fret', value: '2' } }));
  snap('set note 2 tab.course 4', tk.edit({ action: 'set', param: { elementId: ids[1], attribute: 'tab.course', value: '4' } }));
  const last = snap('set note 2 tab.fret 5', tk.edit({ action: 'set', param: { elementId: ids[1], attribute: 'tab.fret', value: '5' } }));
  fs.writeFileSync(outPrefix + '.edited.mei', last.mei);
  fs.writeFileSync(outPrefix + '.edited.p1.svg', last.svg);
  snap('undo', tk.edit({ action: 'undo' }));
  fs.writeFileSync(outPrefix + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
})();
