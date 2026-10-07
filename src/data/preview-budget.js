// The size limits for a post's hover preview, in one place. The content schema
// (src/content/config.ts) refuses text over the hard caps, the previews endpoint
// (src/pages/ledger/previews.json.js) refuses media over them, and
// scripts/preview-media.mjs aims under the targets. PREVIEWS.md says why each number is
// what it is; change a number here and the three of them move together.

export const PREVIEW_TEXT = {
  // Hard caps, in characters. The targets in PREVIEWS.md are lower; these are where the
  // build stops you, set so a careful preview never hits them.
  verdict: 36,
  takeaway: 200,
  point: 150,
  maxPoints: 3,
};

export const PREVIEW_MEDIA = {
  // Every preview still and loop is exactly this frame, so the card's height is known
  // before anything loads and nothing shifts.
  width: 640,
  height: 360,
  fps: 24,
  maxLoopSeconds: 4,
  // What scripts/preview-media.mjs squeezes toward…
  stillTarget: 30 * 1024,
  loopTarget: 150 * 1024,
  // …and what the build refuses outright.
  stillCap: 48 * 1024,
  loopCap: 240 * 1024,
};
