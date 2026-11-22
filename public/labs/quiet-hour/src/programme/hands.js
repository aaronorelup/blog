// THE QUIET HOUR, the maker's hands on the programme bench (owned by hands-builder from here on).
//
//   const hands = createHands({ layout });
//   hands.drawUnder(ctx, S, view)   // the hands' paper shadows on the bench (drawn under the box, dial, strip edge)
//   hands.drawOver(ctx, S, view)    // the hands, cuffs and whatever they hold (drawn over everything on the bench)
//
// Both are called by ./index.js with ctx already in bench units (../layout.js), every frame, fresh from S.
// This is the grey stub's mitten drawing moved here unchanged by programme-art.

export function createHands({ layout }) {
  const { HANDS, CRANK } = layout;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  function poses(S) {
    const H = S.hands, present = clamp(H.present, 0, 1);
    if (present <= 0) return null;
    const dy = (1 - present) * HANDS.off.dy;
    let sum = 0, x = 0, y = 0, rot = 0;
    for (const [pose, wt] of Object.entries(H.left)) {
      const P = HANDS.left[pose]; if (!P || !(wt > 0)) continue;
      x += P.x * wt; y += P.y * wt; rot += P.rot * wt; sum += wt;
    }
    if (sum > 0) { x /= sum; y /= sum; rot /= sum; } else ({ x, y, rot } = HANDS.left.rest);
    const hx = CRANK.x + Math.cos(S.crankAngle) * CRANK.r, hy = CRANK.y + Math.sin(S.crankAngle) * CRANK.r;
    return [
      { x, y: y + dy, rot, lift: (H.fingerLift || 0) - (H.dialTap || 0) },   // left: index lifted / pressed
      { x: hx, y: hy + dy, rot: HANDS.right.crank.rot, lift: 0 },            // right: on the crank (rule 2)
    ];
  }

  function drawUnder(ctx, S, view) {                // eslint-disable-line no-unused-vars
    const P = poses(S); if (!P) return;
    for (const h of P) {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(10, 14, 52, 66, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawOver(ctx, S, view) {                 // eslint-disable-line no-unused-vars
    const P = poses(S); if (!P) return;
    for (const h of P) {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      ctx.fillStyle = '#b9b2a6'; ctx.fillRect(-46, 40, 92, 520);                                                         // knitted cuff
      ctx.fillStyle = '#d9cfc0'; ctx.beginPath(); ctx.ellipse(0, 0, 48, 62, 0, 0, Math.PI * 2); ctx.fill();              // the hand
      ctx.beginPath(); ctx.ellipse(-50, 10, 16, 30, -0.5, 0, Math.PI * 2); ctx.fill();                                   // thumb
      ctx.beginPath(); ctx.ellipse(8, -62 - 18 * h.lift, 12 * (1 + 0.2 * h.lift), 26, 0, 0, Math.PI * 2); ctx.fill();    // index finger
      ctx.restore();
    }
  }

  return { drawUnder, drawOver };
}
