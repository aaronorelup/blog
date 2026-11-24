/* Builds the cave off the page's own thread, with the game's own code (cave.js), so the scroll never stalls. */
import { initSdf, buildCaveMesh, sdf } from './cave.js';

self.onmessage = async (e) => {
  try {
    const { box, chem } = e.data;
    const layout = await (await fetch(new URL('./layout.json', import.meta.url))).json();
    initSdf(layout);
    const t0 = performance.now();
    const m = buildCaveMesh(box);
    // the dropped chemlight rests on the chamber's floor: walk down from the middle of the chamber until rock
    let y = -23;
    while (sdf(chem[0], y, chem[2]) < 0 && y > -40) y -= 0.05;
    self.postMessage({ positions: m.positions, colors: m.colors, tris: m.tris, ms: performance.now() - t0, chemY: y }, [m.positions.buffer, m.colors.buffer]);
  } catch (err) {
    self.postMessage({ error: String(err && err.message || err) });
  }
};
