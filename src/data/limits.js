// Every size limit in one place; PREVIEWS.md and WRITING.md say why each number is what it is.
// Caps fail the build (src/schemas/), targets are what writers and scripts/preview-media.mjs aim under.
export const TEXT = { titleCap: 90, titleTarget: 70, summaryCap: 260, summaryTarget: 240,
                      verdict: 36, takeaway: 200, point: 150, maxPoints: 3 };
// Every preview still and loop is exactly this frame, so a card's height is known before anything loads.
export const PREVIEW_MEDIA = { width: 640, height: 360, fps: 24, maxLoopSeconds: 4,
                               stillTarget: 30 * 1024, loopTarget: 150 * 1024, stillCap: 48 * 1024, loopCap: 240 * 1024 };
export const ICON = { s256Cap: 24 * 1024, s96Cap: 6 * 1024 };
export const PROJECT_IMAGE = { width: 640, height: 360, cap: 60 * 1024 };
export const OG = { width: 1200, height: 630, cap: 150 * 1024 };
