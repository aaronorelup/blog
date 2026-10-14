// 01 · The point (title card, painted plate, noBadge).
// Left column: eyebrow + title + purpose line from frame 0 (the purpose rises 12 px on [[purpose]]); the conclusion
//   writes in line by line as each line is spoken ([[conclusion]]); once it has been read, purpose and conclusion
//   dim to 40% and Aaron's gap card (S004) arrives at [[gap]]; the title-card credit (S249, S209) at y 888.
// Right column: an emblem of "the app" builds while the purpose is spoken: the card and the sparkle worker on
//   "chat", the door pills Chat / Cowork / Code on "chat", "Cowork" and "terminal"; the worker glows on "model".
//   [[overnight]] the emblem steps aside and the real help-center page (capture oct6, shot 'change') slides in at
//   850 px, zoomed onto the 6 October paragraph, with gold boxes on "kept Cowork local", "run in the cloud" and
//   "can't switch back". [[same-app]] the page shrinks into the small dated notice card (S184) at top right, the emblem
//   returns, a hairline draws to a small cool cloud tile, the Cowork pill slides out along it (a dashed slot stays
//   in the app) and the label reads "same app · different computer". Last frame: at rest, plate drift and petals.
SCENE('01', (t, S) => {
  const K = window.K, C = K.C, M = window.M;

  const cPur = S.cue('purpose', 0);
  const cConc = S.cue('conclusion', 13.63);
  const cGap = S.cue('gap', 29.45);
  const cOver = S.cue('overnight', 34.37);
  const cSame = S.cue('same-app', 50.15);
  // the first spoken word matching re at or after local time `after` (S.find counts from the start of the section,
  // and a prefix like 'app' also hits "apps", so this keeps each beat on its own sentence)
  const wordAt = (re, after, fb) => {
    for (let i = 0; i < S.words.length; i++) {
      const w = String(S.words[i][0]).toLowerCase().replace(/[^a-z'’]/g, '');
      if (S.word(i) >= after - 0.05 && re.test(w)) return S.word(i);
    }
    return fb;
  };
  const wChat = wordAt(/^chat$/, cPur, cPur + 1.5);
  const wCow = wordAt(/^cowork$/, cPur, cPur + 2.2);
  const wTerm = wordAt(/^terminal$/, cPur, cPur + 4.4);
  const wModel = wordAt(/^model$/, cConc, cConc + 0.6);
  const wLocal = wordAt(/^local$/, cOver, cOver + 5.0);
  const wKept = wordAt(/^kept$/, cOver, cOver + 3.4);
  const wNew = wordAt(/^new$/, cOver, cOver + 5.5);
  const wCant = wordAt(/^can['’]?t$/, cOver, cOver + 13.5);
  const wApp = wordAt(/^app$/, cSame, cSame + 0.4);
  const wDiff = wordAt(/^different$/, cSame, cSame + 1.3);
  const wComp = wordAt(/^computer$/, cSame, cSame + 1.8);

  K.bg({ glow: 0.4, glowX: 1560, glowY: 600 });
  K.plate('plate', t, { zoom: true, shade: 0.5 });

  const g = K.ctx();
  const blob = (cx, cy, rx, ry, a) => {
    if (a <= 0.002) return;
    g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, K.rgba(C.page, 1)); gr.addColorStop(0.6, K.rgba(C.page, 0.85)); gr.addColorStop(1, K.rgba(C.page, 0));
    g.fillStyle = gr; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
  };
  // soft indigo scrims so cream and gold read over the painted plate
  blob(700, 540, 900, 470, 0.85);
  blob(1580, 540, 440, 440, 0.8 * K.io(t, wChat - 0.6, 0.8));

  // ---------------------------------------------------------------- left column: title, purpose, conclusion
  const X = 140, TW = 1130;
  K.eyebrow('Lantern lesson', X, 200, { size: 26, color: C.head });
  K.title('Where your agent works', X, 290, { size: 92 });

  // once the conclusion has been read, purpose and conclusion step back to 40% for the cards that follow
  // (and fully out while the real page covers their right ends at [[overnight]], so no half-hidden lines show)
  const covered = K.io(t, cOver - 0.5, 0.5) * (1 - K.io(t, cSame + 0.15, 0.6));
  const read = (1 - 0.6 * K.io(t, cGap - 0.4, 0.8)) * (1 - covered);
  const pk = K.io(t, cPur - 0.1, 0.5, 'out');
  const purpose = "In this lesson you'll learn how chat, Cowork, desktop apps and terminal agents differ in what they can reach, which computer the work runs on, and where your files and chats end up.";
  K.layer(read, () => K.para(purpose, X, 362 - 12 * pk, TW, { font: 'read', size: 32, color: C.strong, lh: 44 }));

  // the conclusion writes in, one wrapped line as its first word is spoken
  const conclusion = 'The same model can sit behind every surface, so pick the surface by the output and what it must reach, and before anything private goes in, check which machine runs the work and where your files and chats go.';
  const cOpt = { font: 'read', size: 30, italic: true, color: C.body };
  const cLines = K.wrap(conclusion, TW, cOpt);
  const i0 = S.words.findIndex((w, i) => Math.abs(S.word(i) - cConc) < 0.05);
  let wi = 0;
  cLines.forEach((ln, i) => {
    const at = i0 >= 0 ? S.word(Math.min(S.words.length - 1, i0 + wi)) : cConc + i * 4;
    wi += ln.split(' ').length;
    const k = K.io(t, at - 0.25, 0.55, 'out');
    if (k <= 0.002) return;
    K.text(ln, X + 10 * (1 - k), 520 + i * 42, { ...cOpt, alpha: k * read });
  });

  // [[gap]] Aaron's own gap list (S004), told in the third person
  const gk = K.io(t, cGap - 0.1, 0.6, 'out');
  if (gk > 0.002) {
    K.at(0, 14 * (1 - gk), 1, 0, () => M.dated(X, 662, 760, {
      eyebrow: 'Aaron Orelup · AO-034 · 2026-10-04',
      body: 'chat, Cowork and Code across browser, desktop, CLI and cloud',
      alpha: gk, glow: 0.5 * K.io(t, cGap, 0.4) * (1 - K.io(t, cGap + 3.2, 0.8)),
    }));
  }

  M.credits(X, 888, 1150, { ids: ['S249', 'S209'], more: false });

  // ---------------------------------------------------------------- right column: the app emblem
  // it builds while the purpose names the surfaces, steps aside for the real page at [[overnight]] and comes back
  // for [[same-app]]
  const AX = 1335, AY = 560, AW = 330, AH = 240;
  const away = K.io(t, cOver - 0.45, 0.45) * (1 - K.io(t, cSame + 0.25, 0.5, 'out'));
  const ek = K.io(t, wChat - 0.35, 0.6, 'out') * (1 - away);
  const slide = K.io(t, wDiff - 0.35, 0.8);                 // the Cowork pill leaves the app
  const line = K.io(t, wApp - 0.1, 0.55);                   // the hairline to the cloud draws
  const cloudK = K.io(t, wApp, 0.5, 'out');
  const CX = 1765, CY = 612;                                 // the cloud tile
  if (ek > 0.002) {
    K.layer(ek, () => {
      K.card(AX, AY, AW, AH, { r: 24, fill: K.rgba(C.tile, 0.94) });
      const wg = 0.35 + 0.55 * K.io(t, wModel - 0.15, 0.4) * (1 - K.io(t, wModel + 1.4, 0.8));
      M.worker(t, AX + 72, AY + 112, { s: 84, glow: wg });
    });
    const pills = [['Chat', 615, wChat], ['Cowork', 680, wCow], ['Code', 745, wTerm]];
    pills.forEach(([s, y, at]) => {
      const k = K.io(t, at - 0.2, 0.45, 'out') * ek;
      if (k <= 0.002) return;
      if (s === 'Cowork' && slide > 0) {
        // the app keeps an empty dashed slot where Cowork was
        const sw = K.measure('Cowork', { font: 'ui', weight: 600, size: 26 }) + 26 * 1.6;
        M.dashedRR(AX + 220 - sw / 2, y - 24.5, sw, 49, 24.5, { color: C.line2, alpha: slide * 0.9 * ek });
        return;
      }
      const pop = K.io(t, at - 0.2, 0.3) * (1 - K.io(t, at + 0.5, 0.6));
      K.pill(s, AX + 220 + 12 * (1 - k), y, { size: 26, alpha: k, color: C.strong, fill: C.panel, glow: 0.5 * pop });
    });
  }

  // [[same-app]] the hairline and the cloud tile (the vendor's cool colour: not yours)
  if (line > 0.002) {
    K.line(AX + 220 + 68, 680, CX - 68, 688, { k: line, color: K.rgba(C.head, 0.75), w: 2, dash: [6, 7] });
  }
  if (cloudK > 0.002) {
    K.iconTile('cloud', CX, CY + 10 * (1 - cloudK), 84, { alpha: cloudK, fill: M.P.vendor, stroke: M.P.vendorEdge, color: C.body });
  }
  if (slide > 0.002) {
    const e = K.ease.io(slide);
    const sx = K.lerp(AX + 220, CX, e), sy = K.lerp(680, 690, e);
    const sel = Math.sin(Math.PI * slide);
    K.pill('Cowork', sx, sy, { size: 26, color: C.strong, fill: K.mixColor(C.panel, M.P.vendor, e),
      stroke: K.mixColor(C.head, M.P.vendorEdge, e), glow: 0.6 * sel });
  }
  // the label: 'same app' on "app", 'different computer' on "computer"
  const l1 = K.io(t, wApp - 0.2, 0.45), l2 = K.io(t, wComp - 0.2, 0.5);
  if (l1 > 0.002) {
    const o = { font: 'ui', weight: 600, size: 30 };
    const a = 'same app', b = ' · different computer';
    const wa = K.measure(a, o), wb = K.measure(b, o), x0 = 1585 - (wa + wb) / 2;
    K.text(a, x0, 866, { ...o, color: C.body, alpha: l1 });
    if (l2 > 0.002) K.text(b, x0 + wa + 8 * (1 - l2), 866, { ...o, color: C.head, alpha: l2 });
  }

  // ---------------------------------------------------------------- [[overnight]] the real page, then the card
  // the notice card's place at top right; the page shrinks into it on [[same-app]]
  const NX = 1335, NY = 170, NW = 495;
  const nOpt = {
    eyebrow: 'Anthropic Help Center · 2026-10-06',
    body: "new Cowork tasks run in the cloud · you can't switch back",
    footer: 'Pro and Max',
  };
  const NH = M.dated(NX, NY, NW, { ...nOpt, measure: true });
  // the window shows only the heading and the 6 October paragraph: wide enough (980 px at a 1.42x zoom) that every
  // line shows whole, and cropped just under the paragraph's last line (the page's next paragraph starts at 627 px)
  const PX = 860, PY = 330, PW = 980, BAR = 50, PCH = PW * 1080 / 1920;
  const ZOOM = 1.42, VIS = [296, 606];                       // the page's rows on show (video px)
  const FH = Math.round((VIS[1] - VIS[0]) * (PW / 1920) * ZOOM), PH = BAR + FH;
  const capIn = K.io(t, cOver - 0.05, 0.75, 'out');          // the page slides in from the right
  const shrink = K.ease.io(K.io(t, cSame - 0.1, 0.7, 'lin')); // ... and shrinks into the card
  const pageA = capIn * (1 - K.io(t, cSame + 0.25, 0.4));
  if (pageA > 0.002) {
    const line1 = K.captureBox('oct6', 'change', 'line1', [607.5, 398.4, 1282.5, 174.4]);
    const [x0, y0, W] = line1, lh = line1[3] / 4;           // the 6 October paragraph: four lines
    // a tight box on one line's ink (cap height to descender), from fractions of the paragraph's width
    const ln = (i, a, b) => [x0 + W * a, y0 + i * lh + 0.15 * lh, W * (b - a), 0.8 * lh];
    const tp = t - cOver;                                     // time on the page's own clock
    const s = K.lerp(1, NW / PW, shrink);
    const pcx = PX + PW / 2, pcy = PY + PH / 2;
    const ccx = K.lerp(pcx + 60 * (1 - capIn), NX + NW / 2, shrink);
    const ccy = K.lerp(pcy, NY + NH / 2, shrink);
    const a1 = wKept - cOver - 0.2, a2 = wNew - cOver - 0.25, a3 = wCant - cOver - 0.4;
    K.layer(pageA, () => K.at(ccx - s * pcx, ccy - s * pcy, s, 0, () => {
      K.win(PX, PY, PW, PH, { kind: 'browser', url: 'support.claude.com', compact: true, fill: C.code, shadow: true });
      K.shot('oct6/change', tp, [PX, PY + BAR, PW, PCH], {
        chrome: 'none',
        frame: [PX, PY + BAR, PW, FH],
        // already zoomed when the window arrives; the camera clamps x so the paragraph's right margin stays in
        zooms: [{ at: -5, until: 99, x: x0 + W / 2, y: (VIS[0] + VIS[1]) / 2, z: ZOOM }],
        callouts: [
          // "who kept Cowork local": the removed option, '"Only on your computer" option in Settings > General was
          // removed', which wraps from the end of line 1 onto line 2 (two boxes, undimmed so neither dims the other)
          { at: a1, until: a2, box: ln(0, 0.842, 0.977), pad: 5, dim: false },
          { at: a1, until: a2, box: ln(1, -0.004, 0.548), pad: 5, dim: false },
          // "find new tasks run in the cloud": 'new Cowork tasks on Pro and Max plans run in the cloud.'
          { at: a2, until: a3 - 0.3, box: ln(0, 0.209, 0.790), pad: 5, dim: 0.42 },
          // "you can't switch back"
          { at: a3, until: 99, box: ln(3, 0.401, 0.624), pad: 4, dim: 0.42 },
        ],
      });
    }));
  }
  // the dated card takes over as the page shrinks into it (an opaque backing: it sits over the lit lanterns)
  const nk = K.io(t, cSame + 0.15, 0.5);
  if (nk > 0.002) {
    K.card(NX, NY, NW, NH, { r: 24, fill: K.rgba(C.page, 0.94), alpha: nk });
    M.dated(NX, NY, NW, { ...nOpt, alpha: nk });
  }

  K.petals(t, {
    n: 6, seed: 11, alpha: 0.5,
    avoid: [[110, 150, 1300, 920], [960, 140, 1850, 900]],
  });
});
