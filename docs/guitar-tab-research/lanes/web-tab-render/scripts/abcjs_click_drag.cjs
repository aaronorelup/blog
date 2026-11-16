// Gap round 2 (web-tab-render): drive abcjs 6.7.2's interactive options with the mouse and keyboard in headless
// Chromium (the box's pre-installed Playwright 1.63.0) and record which gesture changed what.
// Pages: pages/abcjs_click_drag.html (renderAbc with dragging: true and a clickListener; mode=listen or mode=apply)
//        pages/abcjs_editor_click.html (ABCJS.Editor with the tablature option; dragging=1 optional)
// Input: the S2n ABC at written pitch (samples/abcjs/S2n.written.abc, served as /lane/out/abcjs/S2n.written.abc).
// Trials (each on a fresh page):
//   A  listen: click a note head, click a tab number, drag a note head up 1 step, drag a note head down 1 step,
//      drag a tab number down by one tab line; tab numbers read before and after; the ABC is never changed by the page.
//   B  apply: the same three drags, with the page's listener rewriting the ABC and redrawing (abcjs's documented way).
//   C  apply + selectTypes=note: click a note head, press ArrowUp, press Enter (abcjs's keyboard dragging).
//   D  Editor: click a tab number in the drawing, type a note name; click another tab number, type another.
//   E  Editor with dragging=1: drag a note head up 1 step.
// Usage: node abcjs_click_drag.cjs <out dir>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const SRC = '/lane/out/abcjs/S2n.written.abc';
const BASE = 'http://127.0.0.1:8765/pages/';
const TUNING = [40, 45, 50, 55, 59, 64]; // sounding open strings, low to high (string 6 .. string 1)
const STEP = 30 * 93 / 720; // abcjs src/write/helpers/spacing.js: spacing.STEP (px at scale 1)

const noteSel = (k) => `#paper svg g.abcjs-note.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-n${k}:not(.abcjs-tabNumber) path.abcjs-notehead`;
const tabSel = (k) => `#paper svg g.abcjs-tabNumber.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-n${k} text`;

async function center(page, sel) {
  // the Editor's textarea takes the focus after a click on the drawing, which can scroll the page: scroll back first
  await page.evaluate(() => window.scrollTo(0, 0));
  const r = await page.$eval(sel, (el) => { const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  return r;
}
async function drag(page, sel, dy) {
  const c = await center(page, sel);
  await page.mouse.move(c.x, c.y);
  await page.mouse.down();
  for (let i = 1; i <= 4; i++) await page.mouse.move(c.x, c.y + (dy * i) / 4);
  await page.mouse.up();
  await page.waitForTimeout(400);
  return { from: c, dy };
}
async function click(page, sel) {
  const c = await center(page, sel);
  await page.mouse.click(c.x, c.y);
  await page.waitForTimeout(400);
  return c;
}
const firstBar = (read) => read.filter((t) => t.voice === 0 && t.measure === 1 && t.line === 0)
  .map((t) => ({ text: t.text, string: t.string }));
function diff(before, after) {
  const changed = [];
  const n = Math.max(before.length, after.length);
  for (let i = 0; i < n; i++) {
    const b = before[i]; const a = after[i];
    if (!b || !a || b.text !== a.text || b.string !== a.string) changed.push({ i, before: b ? { text: b.text, string: b.string } : null, after: a ? { text: a.text, string: a.string } : null });
  }
  return changed;
}
function estJson(read) { // gtr-eval tab JSON, pseudo-onset (line * 100000 + x) / 1000 s as in abcjs_tab_readout.cjs
  const notes = read.filter((t) => /^\d+$/.test(t.text)).map((t) => ({ onset: +(((t.line * 100000) + t.x) / 1000).toFixed(4),
    string: t.string, fret: parseInt(t.text, 10), pitch: TUNING[6 - t.string] + parseInt(t.text, 10), line: t.line }));
  return { tuning_midi: TUNING, capo: 0, notes, source: 'abcjs SVG tab numbers read back by abcjs_click_drag.cjs' };
}
async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1240, height: 1100 } });
  const msgs = [];
  page.on('console', (m) => msgs.push(m.type() + ': ' + m.text().slice(0, 300)));
  page.on('pageerror', (e) => msgs.push('pageerror: ' + String(e).slice(0, 300)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__rendered === true', null, { timeout: 30000 });
  return { page, msgs };
}

(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch();
  const res = { input: SRC, step_px: STEP, trials: {} };

  // ---- A: listen only
  {
    const { page, msgs } = await openPage(browser, BASE + 'abcjs_click_drag.html?mode=listen&src=' + SRC);
    const before = await page.evaluate(() => window.__tabRead());
    const abc0 = await page.evaluate(() => window.__abc());
    const tabLine = (await center(page, tabSel(0))).y - (await center(page, tabSel(2))).y; // string 3 to string 2
    const steps = [];
    steps.push({ gesture: 'click note head, melody bar 1 note 1', at: await click(page, noteSel(0)) });
    steps.push({ gesture: 'click tab number, melody bar 1 note 1', at: await click(page, tabSel(0)) });
    steps.push({ gesture: 'drag note head up by 1 step, melody bar 1 note 1', ...(await drag(page, noteSel(0), -STEP)) });
    steps.push({ gesture: 'drag note head down by 1 step, melody bar 1 note 2', ...(await drag(page, noteSel(1), STEP)) });
    steps.push({ gesture: 'drag tab number down by one tab line, melody bar 1 note 3', ...(await drag(page, tabSel(2), tabLine)) });
    const after = await page.evaluate(() => window.__tabRead());
    const events = await page.evaluate(() => window.__events);
    const transforms = await page.evaluate(() => [...document.querySelectorAll('#paper svg g[transform]')]
      .map((g) => ({ cls: g.getAttribute('class'), transform: g.getAttribute('transform') })));
    const abc1 = await page.evaluate(() => window.__abc());
    await page.screenshot({ path: path.join(out, 'A_listen_after_drags.png'), fullPage: true });
    res.trials.A_listen = { steps, tab_line_px: tabLine, events, n_tab_before: before.length, n_tab_after: after.length,
      tab_changes: diff(before, after), abc_changed: abc0 !== abc1, renders: await page.evaluate(() => window.__renders),
      translated_groups: transforms, first_bar_before: firstBar(before), console: msgs };
    await page.close();
  }

  // ---- B: apply (the page rewrites the ABC on a drag and draws again)
  {
    const { page, msgs } = await openPage(browser, BASE + 'abcjs_click_drag.html?mode=apply&src=' + SRC);
    const before = await page.evaluate(() => window.__tabRead());
    const tabLine = (await center(page, tabSel(0))).y - (await center(page, tabSel(2))).y;
    const steps = [];
    const one = async (gesture, sel, dy) => {
      const pre = await page.evaluate(() => window.__tabRead());
      const r = await drag(page, sel, dy);
      await page.waitForFunction('window.__rendered === true');
      await page.waitForTimeout(200);
      const post = await page.evaluate(() => window.__tabRead());
      steps.push({ gesture, ...r, renders: await page.evaluate(() => window.__renders), tab_changes: diff(pre, post), first_bar_after: firstBar(post) });
    };
    await one('drag note head up by 1 step, melody bar 1 note 1', noteSel(0), -STEP);
    await one('drag note head down by 1 step, melody bar 1 note 2', noteSel(1), STEP);
    await one('drag tab number down by one tab line, melody bar 1 note 3', tabSel(2), tabLine);
    const after = await page.evaluate(() => window.__tabRead());
    const abc = await page.evaluate(() => window.__abc());
    fs.writeFileSync(path.join(out, 'B_apply.edited.abc'), abc);
    fs.writeFileSync(path.join(out, 'B_apply.tab.json'), JSON.stringify(estJson(after), null, 1));
    await page.screenshot({ path: path.join(out, 'B_apply_after_drags.png'), fullPage: true });
    res.trials.B_apply = { steps, tab_line_px: tabLine, events: await page.evaluate(() => window.__events),
      n_tab_before: before.length, n_tab_after: after.length, tab_changes_total: diff(before, after),
      first_bar_before: firstBar(before), first_bar_after: firstBar(after), console: msgs };
    await page.close();
  }

  // ---- C: keyboard dragging (selectTypes given, so notes get tabindex and key handlers), apply mode
  {
    const { page, msgs } = await openPage(browser, BASE + 'abcjs_click_drag.html?mode=apply&selectTypes=note&src=' + SRC);
    const before = await page.evaluate(() => window.__tabRead());
    const steps = [];
    steps.push({ gesture: 'click note head, melody bar 1 note 1', at: await click(page, noteSel(0)),
      active: await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('class')) });
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);
    steps.push({ gesture: 'key ArrowUp', transform: await page.evaluate(() => { const g = document.querySelector('#paper svg g[transform]'); return g ? g.getAttribute('transform') : null; }) });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    await page.waitForFunction('window.__rendered === true');
    const after = await page.evaluate(() => window.__tabRead());
    steps.push({ gesture: 'key Enter' });
    const tabClick = await page.$(tabSel(1));
    res.trials.C_keyboard = { steps, events: await page.evaluate(() => window.__events), renders: await page.evaluate(() => window.__renders),
      tab_changes: diff(before, after), first_bar_after: firstBar(after),
      tab_number_selectable_attr: tabClick ? await page.$eval(`#paper svg g.abcjs-tabNumber.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-n1`, (g) => g.getAttribute('selectable')) : null,
      note_selectable_attr: await page.$eval(`#paper svg g.abcjs-note.abcjs-l0.abcjs-m1.abcjs-v0.abcjs-n1:not(.abcjs-tabNumber)`, (g) => g.getAttribute('selectable')),
      abc_bar1: (await page.evaluate(() => window.__abc())).split('\n').find((l) => l.startsWith('z16')), console: msgs };
    await page.close();
  }

  // ---- D: ABCJS.Editor, click on the tab, then type
  {
    const { page, msgs } = await openPage(browser, BASE + 'abcjs_editor_click.html?src=' + SRC);
    const before = await page.evaluate(() => window.__tabRead());
    const steps = [];
    // the user reads the selected text in the textarea and types it again with the new letter (spaces kept)
    const clickType = async (k, fromLetter, toLetter) => {
      const at = await click(page, tabSel(k));
      const sel = await page.evaluate(() => window.__textState());
      const typed = sel.selected.replace(fromLetter, toLetter);
      await page.keyboard.type(typed);
      await page.waitForTimeout(1000);
      const post = await page.evaluate(() => window.__tabRead());
      // the first four tab numbers in document order are melody bar 1 (the Editor page's read-back has no voice classes)
      steps.push({ gesture: `click tab number, melody bar 1 note ${k + 1}; type ${JSON.stringify(typed)}`, at, textarea_after_click: sel,
        typed, first_four_after: post.slice(0, 4).map((t) => ({ text: t.text, string: t.string })) });
    };
    await clickType(0, 'G', 'A');
    await clickType(1, 'G', 'F');
    const after = await page.evaluate(() => window.__tabRead());
    const text = await page.$eval('#abc', (t) => t.value);
    fs.writeFileSync(path.join(out, 'D_editor.edited.abc'), text);
    fs.writeFileSync(path.join(out, 'D_editor.tab.json'), JSON.stringify(estJson(after.map((t) => ({ ...t }))), null, 1));
    await page.screenshot({ path: path.join(out, 'D_editor_after_edits.png'), fullPage: true });
    res.trials.D_editor_click_type = { steps, events: await page.evaluate(() => window.__events), n_tab_before: before.length,
      n_tab_after: after.length, tab_changes_total: diff(before, after), console: msgs };
    await page.close();
  }

  // ---- E: ABCJS.Editor with dragging: true, drag a note head
  {
    const { page, msgs } = await openPage(browser, BASE + 'abcjs_editor_click.html?dragging=1&src=' + SRC);
    const before = await page.evaluate(() => window.__tabRead());
    const text0 = await page.$eval('#abc', (t) => t.value);
    const r = await drag(page, noteSel(0), -STEP);
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => window.__tabRead());
    const text1 = await page.$eval('#abc', (t) => t.value);
    res.trials.E_editor_drag = { gesture: 'drag note head up by 1 step, melody bar 1 note 1', ...r,
      events: await page.evaluate(() => window.__events), textarea_after: await page.evaluate(() => window.__textState()),
      text_changed: text0 !== text1, tab_changes: diff(before, after), console: msgs };
    await page.close();
  }

  await browser.close();
  res.wall_ms = Date.now() - t0;
  fs.writeFileSync(path.join(out, 'abcjs_click_drag.json'), JSON.stringify(res, null, 1));
  const brief = {};
  for (const [k, v] of Object.entries(res.trials)) brief[k] = { events: (v.events || []).map((e) => ({ el: e.el_type, text: e.text, drag: e.drag && e.drag.step, applied: e.applied })), changes: v.tab_changes || v.tab_changes_total };
  console.log(JSON.stringify(brief));
})();
