/* 01.05 scene 11 — Keys in the satchel
   Part A (named-key, env-file): the open satchel gets a KEY card; the readable cards name it
   (OPENAI_API_KEY, ANTHROPIC_API_KEY, values masked); the .env file is how it usually gets in.
   Part B (both-ways .. status): the satchel shrinks onto the terminal courier; the key is copied into
   every courier it sends, including the agent and everything the agent runs (five copies); the agent's
   bill: API key = pay per use, the subscription struck; /status shows which one pays. */
SCENE('11', (t, S) => {
  const C = K.C, P = M.P;
  K.bg();

  // ---- cues (local seconds) and spoken words
  const cKey = S.cue('named-key', 0);
  const cEnv = S.cue('env-file', 16.27);
  const cBoth = S.cue('both-ways', 27.89);
  const cAgent = S.cue('agent-copies', 36.19);
  const cBill = S.cue('billing', 40.31);
  const cStatus = S.cue('status', 55.82);
  const w = (s, n, fb) => S.find(s, n, fb);
  const tKeys = w('keys', 0, cKey + 1.7);
  const tOpen = w('Open', 0, cKey + 6.9);
  const tAnth = w('Anthropic', 0, cKey + 10.2);
  const tOut = w('keeps', 0, cKey + 13.7);
  const tGets = w('gets', 0, cEnv + 3.7);
  const tLib = w('library', 0, cEnv + 5.5);
  const tBun = w('Bun', 0, cEnv + 8.6);
  const tNode = w('Node', 0, cEnv + 10.1);
  const tTerm = w("terminal's", 0, cBoth + 3.4);
  const tCopied = w('copied', 0, cBoth + 5.1);
  const tCommand = w('command', 0, cAgent + 1.8);
  const tClaude = w('Claude', 0, cBill + 2.7);
  const tUses = w('uses', 0, cBill + 3.6);
  const tSub = w('subscription', 0, cBill + 7.2);
  const tInter = w('interactive', 0, cBill + 12.1);
  const tNever = w('never', 0, cBill + 13.6);

  const tEvery = w('every', 0, cBoth + 5.9);

  // ---- part A <-> part B switch
  const aOut = K.io(t, cBoth, 0.6);          // part A furniture leaves (the satchel stays)
  const morph = K.io(t, cBoth + 0.5, 1.4);   // big satchel shrinks onto the terminal courier
  const bIn = K.io(t, cBoth + 1.15, 0.6);     // terminal tile arrives under it
  const shiftK = K.io(t, cBill, 0.9);        // on billing the graph slides left to make room for the card
  const dx = -300 * shiftK;

  // ---- part B geometry (centred fan-out; shifts left by 300 on billing)
  const TER = { x: 520 + dx, y: 480, s: 110 };
  const SCR = { x: 960 + dx, y: 280, s: 80 };
  const AGT = { x: 960 + dx, y: 650, s: 100 };
  const GK = [{ x: 1420 + dx, y: 460, l: 'command' }, { x: 1420 + dx, y: 630, l: 'package' }, { x: 1420 + dx, y: 800, l: 'script' }];
  const GS = 64;
  const terSat = { x: 520 + TER.s * 0.48, y: TER.y + TER.s * 0.3, s: TER.s * 0.7 };

  // ================================================================ PART A
  const BIG = { x: 400, y: 640, s: 340 };
  if (t < cBoth + 2.2) {
    const keyIn = K.io(t, tKeys, 0.6);
    const keyLift = K.io(t, tKeys + 0.2, 0.5) * (1 - K.io(t, cEnv - 0.6, 0.5));
    const keyLit = Math.max(0.5 * K.io(t, tGets + 0.9, 0.4) * (1 - K.io(t, tGets + 2.4, 0.6)), 0.7 * K.io(t, cBoth, 0.4));
    const sx = K.lerp(BIG.x, terSat.x, morph), sy = K.lerp(BIG.y, terSat.y, morph), ss = K.lerp(BIG.s, terSat.s, morph);
    const satA = 1 - K.io(t, cBoth + 1.75, 0.3);
    M.satchel(t, sx, sy, ss, {
      open: 1, alpha: K.io(t, -0.4, 0.6) * satA, strap: morph > 0.3 ? 'none' : 'handle',
      cards: [
        { name: 'HOME', alpha: 1 - morph },
        { name: 'PATH', kind: 'path' },
        { name: 'KEY', kind: 'key', alpha: keyIn, lift: keyLift, lit: keyLit },
      ],
    });
    // the label rides with the satchel while it shrinks into the terminal
    M.label("your terminal's satchel", sx, sy + ss * 0.34 + 56, { size: 26, alpha: K.io(t, 0.2, 0.6) * (1 - K.io(t, cBoth + 0.9, 0.6)) });
    K.layer(1 - aOut, () => {

      // readable cards: the known names
      const nameW = 440;
      const oA = K.io(t, tOpen, 0.6), aA = K.io(t, tAnth, 0.6);
      K.rise(t, tOpen, () => M.envCard(700, 210, { w: 1100, name: 'OPENAI_API_KEY', value: 'sk-proj-••••••••••••', kind: 'key', nameW, alpha: oA }));
      K.rise(t, tAnth, () => M.envCard(700, 340, { w: 1100, name: 'ANTHROPIC_API_KEY', value: 'sk-ant-••••••••••••', kind: 'key', nameW, alpha: aA, lit: K.io(t, tAnth + 0.4, 0.5) * 0.8 }));
      // gold dashed tie: the lifted KEY card in the satchel IS this card
      const tie = K.io(t, tAnth + 0.5, 0.6) * (1 - K.io(t, cEnv - 0.6, 0.5));
      if (tie > 0) K.arrow(BIG.x + 70, BIG.y - 250, 700 - 14, 388, { k: tie, bend: -60, color: K.rgba(C.head, 0.7), dash: [8, 8], w: 2.5, head: false });
      // the point of a known name
      const kOut = K.io(t, tOut, 0.6);
      if (kOut > 0) {
        K.spans([{ s: 'known name', color: C.strong }, { s: '  ·  ', color: C.soft }, { s: 'key out of your code', color: C.strong }],
          1250, 520, { align: 'center', size: 30, font: 'ui', alpha: kOut * (1 - K.io(t, cEnv, 0.5)) });
      }

      // the .env file: last lesson's back-room file, the usual way in
      const eK = K.io(t, cEnv, 0.6);
      if (eK > 0) {
        K.layer(eK, () => {
          M.eyebrow('from 01.04', 960, 532, {});
          K.file(960, 650, 150, { name: '.env', nameSize: 30 });
        });
        // its key line flies into the satchel
        M.copyFly(940, 620, BIG.x + 40, BIG.y - 120, K.seg(t, tGets - 0.3, tGets + 0.6), { name: 'KEY', kind: 'key', w: 100, h: 110, bend: -140 });
        // three ways it is loaded
        const pills = [
          { at: tLib, s: 'a library loads it', font: 'ui' },
          { at: tBun, s: 'Bun: automatic', font: 'ui' },
          { at: tNode, s: 'Node: --env-file', font: 'mono' },
        ];
        pills.forEach((p, i) => {
          const k = K.io(t, p.at, 0.5);
          if (k <= 0) return;
          K.pill(p.s, 1450, 590 + i * 90 - 20 * (1 - k), { size: 28, font: p.font, color: C.strong, w: 380, alpha: k });
        });
        // a quiet bracket from the file to the three ways
        const br = K.io(t, tLib - 0.2, 0.5);
        if (br > 0) K.line(1060, 680, 1240, 680, { k: br, color: C.line2, w: 2, dash: [6, 8] });
      }
    });
  }

  // ================================================================ PART B
  if (bIn > 0) {
    // timing: script child, copy on "copied"; agent on "send"; agent copy on "agent-copies";
    // then command / package / script, 0.3 s apart
    const scrIn = K.io(t, cBoth + 1.5, 0.6);
    const agtIn = K.io(t, tEvery, 0.6);
    const flyS = K.seg(t, tTerm - 0.2, tTerm + 0.6);
    const flyA = K.seg(t, cAgent + 0.2, cAgent + 1.0);
    const gkIn = (i) => K.io(t, tCommand - 0.5 + i * 0.3, 0.5);
    const flyG = (i) => K.seg(t, tCommand - 0.35 + i * 0.3, tCommand + 0.45 + i * 0.3);
    const glowEnd = K.io(t, cStatus + 1.4, 1.2) * 0.45;
    const keyCard = (landed, lit) => (landed ? [{ name: 'KEY', kind: 'key', lit: lit || undefined }] : []);
    const billK = K.io(t, cBill + 0.5, 0.6);
    const dimRest = 0.55 * billK * (1 - K.io(t, cStatus + 1.4, 0.8));

    // links: who sent whom (dim dashed, not gold)
    const link = (a, b, k, al = 1) => { if (k > 0) K.line(a.x + a.s * 0.62, a.y, b.x - b.s * 0.62, b.y, { k, color: C.line2, w: 2.5, dash: [8, 8], alpha: 0.8 * al }); };
    link(TER, SCR, scrIn, 1 - dimRest * 0.6);
    link(TER, AGT, agtIn);
    GK.forEach((g, i) => link(AGT, { ...g, s: GS }, gkIn(i), 1 - dimRest * 0.6));

    // the terminal (parent); its satchel takes over from the morphing big one
    const termPulse = K.io(t, tTerm, 0.4) * (1 - K.io(t, cAgent, 0.6));
    M.courier(t, TER.x, TER.y, TER.s, {
      icon: 'terminal', label: 'terminal', alpha: bIn, lit: 0.7 * termPulse,
      satchel: { open: 1, alpha: K.io(t, cBoth + 1.75, 0.3), cards: [{ name: 'PATH', kind: 'path' }, { name: 'KEY', kind: 'key' }] },
      dim: dimRest * 0.5,
    });

    // the two children
    M.courier(t, SCR.x, SCR.y, SCR.s, {
      icon: 'code', label: 'your script', alpha: scrIn, dim: dimRest,
      satchel: { open: 1, cards: keyCard(flyS >= 1, glowEnd) },
    });
    const agentLit = K.io(t, cAgent, 0.5) * 0.9;
    const agentLabel = t < tClaude ? 'agent' : 'Claude Code';
    const lblK = t < tClaude ? K.io(t, cAgent, 0.4) : K.io(t, tClaude, 0.4);
    M.courier(t, AGT.x, AGT.y, AGT.s, {
      icon: 'sparkle', lantern: 1, label: null, alpha: agtIn, lit: agentLit,
      satchel: { open: 1, cards: keyCard(flyA >= 1, glowEnd || (billK > 0 ? 0.6 * billK : 0)) },
    });
    K.layer(agtIn, () => M.label(agentLabel, AGT.x, AGT.y + AGT.s * 0.5 + 44, { size: 28, color: agentLit > 0.5 ? C.strong : P.label, alpha: lblK }));

    // the agent's three couriers
    GK.forEach((g, i) => {
      M.courier(t, g.x, g.y, GS, {
        icon: 'terminal', label: g.l, alpha: gkIn(i), dim: dimRest,
        satchel: { open: 1, cards: keyCard(flyG(i) >= 1, glowEnd) },
      });
    });

    // key tags: the KEY card peeking out of each small satchel (the satchel's own cards are too small to read)
    const keyTag = (c, s, k, lit) => {
      if (k <= 0) return;
      const ss = s * 0.7, x = c.x + s * 0.48, top = c.y + s * 0.3 - ss * 0.34 - 30;
      const tw = Math.max(34, s * 0.42), th = tw * 1.05;
      K.layer(k, () => {
        if (lit > 0) K.glow(x, top + th / 2, tw * 1.4, C.head, 0.5 * lit);
        K.card(x - tw / 2, top, tw, th, { r: 6, fill: P.paper, stroke: lit > 0 ? K.mixColor(P.paper, C.head, lit) : P.paper, shadow: true });
        K.icon('key', x, top + th / 2, tw * 0.7, { color: C.accent, w: 3 });
      });
    };
    keyTag(TER, TER.s, K.io(t, cBoth + 1.75, 0.3) * bIn, Math.max(glowEnd, 0.8 * termPulse));
    keyTag(SCR, SCR.s, K.io(t, tTerm + 0.55, 0.2) * scrIn * (1 - 0.65 * dimRest), Math.max(glowEnd, 0.8 * K.io(t, tCopied, 0.3) * (1 - K.io(t, tCopied + 1.0, 0.6))));
    keyTag(AGT, AGT.s, K.io(t, cAgent + 0.95, 0.2) * agtIn, Math.max(glowEnd, 0.7 * billK * (1 - K.io(t, cStatus + 1.4, 0.8))));
    GK.forEach((g, i) => keyTag(g, GS, K.io(t, tCommand + 0.4 + i * 0.3, 0.2) * gkIn(i) * (1 - 0.65 * dimRest), glowEnd));

    // flying key copies
    const tS = { x: TER.x + TER.s * 0.48, y: TER.y + TER.s * 0.3 - 20 };
    const aim = (c, s) => ({ x: c.x + s * 0.48, y: c.y + s * 0.3 - s * 0.7 * 0.35 });
    const sA = aim(SCR, SCR.s), aA = aim(AGT, AGT.s);
    M.copyFly(tS.x, tS.y, sA.x, sA.y, flyS, { name: 'KEY', kind: 'key', w: 70, h: 84, size: 22, bend: -90 });
    M.copyFly(tS.x, tS.y, aA.x, aA.y, flyA, { name: 'KEY', kind: 'key', w: 70, h: 84, size: 22, bend: -60 });
    const aSat = { x: AGT.x + AGT.s * 0.48, y: AGT.y + AGT.s * 0.3 - 20 };
    GK.forEach((g, i) => {
      const d = aim(g, GS);
      M.copyFly(aSat.x, aSat.y, d.x, d.y, flyG(i), { name: 'KEY', kind: 'key', w: 60, h: 72, size: 22, bend: -70 });
    });

    // count of copies (five), once they have all landed; it stays above the agent's couriers
    const fiveK = K.io(t, tCommand + 1.3, 0.5);
    if (fiveK > 0) M.label('5 copies of the key', GK[0].x, 340, { size: 30, color: C.strong, alpha: fiveK * (1 - 0.5 * dimRest) });

    // ---- billing: who pays when ANTHROPIC_API_KEY is set
    if (billK > 0) {
      const bx = 1370, by = 290, bw = 450, bh = 400;
      K.layer(billK, () => {
        K.card(bx, by, bw, bh, { r: 22, stroke: C.line2, shadow: true });
        M.eyebrow('who pays', bx + bw / 2, by + 50, {});
        // row 1: the key wins
        const r1 = K.io(t, tUses, 0.5);
        K.layer(r1, () => {
          K.icon('key', bx + 52, by + 116, 40, { color: C.accent, w: 3.5 });
          K.text('API key: pay per use', bx + 90, by + 127, { font: 'ui', weight: 700, size: 30, color: C.accent });
        });
        // row 2: the subscription, struck
        const r2 = K.io(t, tSub, 0.5), strike = K.io(t, tSub + 0.4, 0.5);
        K.layer(r2, () => {
          K.icon('person', bx + 52, by + 186, 38, { color: C.soft, w: 3 });
          const tw = K.text('subscription', bx + 90, by + 197, { font: 'ui', weight: 600, size: 30, color: C.soft, alpha: 1 - 0.35 * strike });
          K.line(bx + 84, by + 186, bx + 96 + tw, by + 186, { k: strike, color: C.soft, w: 3 });
        });
        K.line(bx + 30, by + 238, bx + bw - 30, by + 238, { color: C.line2, w: 2, alpha: K.io(t, tInter - 0.4, 0.4) });
        // rows 3, 4: does it ask?
        const r3 = K.io(t, tInter, 0.5), r4 = K.io(t, tNever, 0.5);
        K.text('interactive: asks once', bx + 40, by + 292, { font: 'ui', weight: 600, size: 28, color: C.body, alpha: r3 });
        K.text('scripted run: never asks', bx + 40, by + 350, { font: 'ui', weight: 700, size: 28, color: C.accent, alpha: r4 });
      });
    }
    // ---- /status
    const stK = K.io(t, cStatus + 0.2, 0.5);
    if (stK > 0) {
      K.pill('/status', 1595, 770, { font: 'mono', size: 30, color: C.strong, w: 200, alpha: stK });
      M.label('shows which one pays', 1595, 850, { size: 28, alpha: K.io(t, cStatus + 2.0, 0.5) });
    }
  }
});
