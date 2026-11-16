// Gap round 2 (web-tab-render): edit tablature through @coderline/alphatab-monaco 1.9.0 (alphaTex in the Monaco editor
// with the alphaTex language server) in headless Chromium (the box's pre-installed Playwright 1.63.0), with alphaTab
// 1.9.0 re-rendering 250 ms after each edit (pages/alphatab_monaco.html). Every edit is made with the mouse and the
// keyboard on the editor, as a user would; the page's helpers only report positions and state.
//   1  fret:   double-click the fret digit of melody bar 1 note 1 ("0" of 0.3.4), type "2"
//   2  string: double-click the fret digit of melody bar 1 note 2 ("0" of 0.3.4), type "5"; then its string digit ("3"), type "4"
//   -> export 1: Guitar Pro 7 (.gp) and alphaTex from alphaTab, and the editor's own text
//   3  an impossible string: double-click the string digit of bass bar 1 note 1 ("6" of 3.6.4), type "7"; read the
//      editor's diagnostics (markers) and alphaTab's error events; then Control+Z
//   4  capo: click at the end of the \tuning line, End, Enter, type "\ca" (read the suggestion list), Escape, type "po 2"
//   -> export 2
// Usage: node alphatab_monaco_edit.cjs <alphaTex url> <out dir>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const [, , texUrl, out] = process.argv;
fs.mkdirSync(out, { recursive: true });

(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1300 } });
  const msgs = [];
  page.on('console', (m) => msgs.push(m.type() + ': ' + m.text().slice(0, 300)));
  page.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:8765/pages/alphatab_monaco.html?tex=' + texUrl, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true && window.__renders >= 1', null, { timeout: 60000 });
  await page.waitForTimeout(800);
  const res = { tex: texUrl, steps: [] };
  const state = async () => page.evaluate(() => ({
    renders: window.__renders, texCalls: window.__texCalls,
    melody_bar1: [0, 1, 2, 3].map((b) => window.__note(1, 0, b, 0)),
    bass_bar1_note1: window.__note(1, 1, 0, 0),
    staff: window.__staff(), markers: window.__markers(),
    errors: window.__log.filter((l) => l.type === 'alphatab_error' || l.type.startsWith('lsp_') && l.type !== 'lspInitialized' || l.type === 'page_error'),
  }));
  const lineOf = async (prefix, from = 1) => page.evaluate(([p, f]) => {
    const lines = window.__text().split('\n');
    for (let i = f - 1; i < lines.length; i++) if (lines[i].startsWith(p)) return i + 1;
    return -1;
  }, [prefix, from]);
  const at = async (line, col) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    return page.evaluate(([l, c]) => window.__pos(l, c), [line, col]);
  };
  const dblclick = async (line, col) => {
    const p = await at(line, col);
    await page.mouse.dblclick(p.x + 3, p.y);
    await page.waitForTimeout(200);
    return page.evaluate(() => window.__selection());
  };
  // wait for the next render, or for alphaTab's error event when the edited alphaTex does not parse
  const settle = async (rendersBefore) => {
    const errorsBefore = await page.evaluate(() => window.__log.filter((l) => l.type === 'alphatab_error').length);
    await page.waitForFunction(([n, e]) => window.__renders > n || window.__log.filter((l) => l.type === 'alphatab_error').length > e,
      [rendersBefore, errorsBefore], { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600); // the language server's diagnostics come 150 ms after the last change
  };
  const lineText = async (l) => page.evaluate((x) => window.__text().split('\n')[x - 1], l);

  res.initial = await state();
  res.lsp_init_log = await page.evaluate(() => window.__log.filter((l) => ['grammarRegistered', 'lspInitialized', 'ready', 'postRenderFinished'].includes(l.type)).slice(0, 5));
  const L = await lineOf('0.3.4 0.3.4 3.2.4 3.2.4');
  const LB = await lineOf('3.6.4 0.4.4 3.6.4 0.4.4');
  res.lines = { melody_bar1: L, bass_bar1: LB, melody_bar1_text: await lineText(L), bass_bar1_text: await lineText(LB) };

  // 1: fret
  {
    const r0 = (await state()).renders;
    const sel = await dblclick(L, 1);
    await page.keyboard.type('2');
    await settle(r0);
    res.steps.push({ edit: 'fret', gesture: 'double-click the fret digit of melody bar 1 note 1, type "2"', selected: sel, line_after: await lineText(L), after: await state() });
  }
  // 2: string (fret first, then string digit)
  {
    let r0 = (await state()).renders;
    const sel1 = await dblclick(L, 7);
    await page.keyboard.type('5');
    await settle(r0);
    const mid = await state();
    const lineMid = await lineText(L);
    r0 = mid.renders;
    const sel2 = await dblclick(L, 9);
    await page.keyboard.type('4');
    await settle(r0);
    res.steps.push({ edit: 'string', gesture: 'double-click the fret digit of melody bar 1 note 2, type "5"; double-click its string digit, type "4"',
      selected_first: sel1, line_between: lineMid, between: { melody_bar1_note2: mid.melody_bar1[1], markers: mid.markers },
      selected_second: sel2, line_after: await lineText(L), after: await state() });
  }
  // export 1
  {
    const ex = await page.evaluate(() => window.__export());
    fs.writeFileSync(path.join(out, 'S2n.monaco_edited.gp'), Buffer.from(ex.gp));
    fs.writeFileSync(path.join(out, 'S2n.monaco_edited.export.atex'), ex.tex);
    fs.writeFileSync(path.join(out, 'S2n.monaco_edited.editor.atex'), await page.evaluate(() => window.__text()));
    await page.screenshot({ path: path.join(out, 'S2n.monaco_edited.png'), fullPage: true });
    res.export1 = { gpBytes: ex.gp.length, texChars: ex.tex.length };
  }
  // 3: an impossible string number, then undo
  {
    let r0 = (await state()).renders;
    const sel = await dblclick(LB, 3);
    await page.keyboard.type('7');
    await settle(r0);
    await page.waitForTimeout(800);
    const bad = await state();
    const badLine = await lineText(LB);
    const logTail = await page.evaluate(() => window.__log.slice(-6));
    await page.screenshot({ path: path.join(out, 'S2n.monaco_string7.png'), fullPage: false });
    r0 = bad.renders;
    await page.keyboard.press('Control+Z');
    await settle(r0);
    await page.waitForTimeout(800);
    res.steps.push({ edit: 'impossible string', gesture: 'double-click the string digit of bass bar 1 note 1, type "7"; then Control+Z',
      selected: sel, line_with_7: badLine, with_7: bad, log_tail_with_7: logTail, line_after_undo: await lineText(LB), after_undo: await state() });
  }
  // 4: capo through the editor
  {
    const LT = await lineOf('\\tuning');
    const r0 = (await state()).renders;
    const len = (await lineText(LT)).length;
    const p = await at(LT, len + 1);
    await page.mouse.click(p.x + 2, p.y);
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('\\ca');
    await page.waitForTimeout(1200);
    const suggestions = await page.evaluate(() => [...document.querySelectorAll('.suggest-widget .monaco-list-row')]
      .map((r) => (r.getAttribute('aria-label') || r.textContent || '').slice(0, 120)));
    await page.keyboard.press('Escape');
    await page.keyboard.type('po 2');
    await settle(r0);
    res.steps.push({ edit: 'capo', gesture: 'click at the end of the \\tuning line, End, Enter, type "\\ca", Escape, type "po 2"',
      tuning_line: LT, suggestions_after_backslash_ca: suggestions, new_line: await lineText(LT + 1), after: await state() });
    const ex = await page.evaluate(() => window.__export());
    fs.writeFileSync(path.join(out, 'S2n.monaco_capo2.gp'), Buffer.from(ex.gp));
    fs.writeFileSync(path.join(out, 'S2n.monaco_capo2.export.atex'), ex.tex);
    fs.writeFileSync(path.join(out, 'S2n.monaco_capo2.editor.atex'), await page.evaluate(() => window.__text()));
    await page.screenshot({ path: path.join(out, 'S2n.monaco_capo2.png'), fullPage: true });
    res.export2 = { gpBytes: ex.gp.length, texChars: ex.tex.length };
  }
  res.page_log = await page.evaluate(() => window.__log.filter((l) => l.type !== 'renderFinished'));
  res.console = msgs;
  res.wall_ms = Date.now() - t0;
  fs.writeFileSync(path.join(out, 'alphatab_monaco_edit.json'), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ lines: res.lines, steps: res.steps.map((s) => ({ edit: s.edit, line: s.line_after || s.new_line, note: s.after && s.after.melody_bar1.slice(0, 2), markers: (s.with_7 || {}).markers })), export1: res.export1, export2: res.export2, n_console: msgs.length }));
  await browser.close();
})();
