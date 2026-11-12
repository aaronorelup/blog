// <ao-demo name="goobie-lab" part="windows|context|rag|agent">: three ways to give an AI model the blog, on recorded runs
// (scripts/eval/lab/ wrote runs/*.json): in-context (every post in one cached prompt), classic RAG (the nearest
// chunks) and agentic search (the model calls tools). The model's words are replayed; what the browser can do for
// free runs live: the window and map maths, the k slider, the growth slider, and the agent's tools on the live site.
import { lazy } from '../../../../scripts/lazy.js';

const PARTS = {
  windows: () => Promise.all([import('./windows.js'), Promise.all([import('./runs/context.json'), import('./runs/rag.json'),
    import('./runs/agent.json')]).then(([context, rag, agent]) => ({ default: { context: context.default, rag: rag.default, agent: agent.default } }))]),
  context: () => Promise.all([import('./context.js'), import('./runs/context.json')]),
  rag: () => Promise.all([import('./rag.js'), import('./runs/rag.json')]),
  agent: () => Promise.all([import('./agent.js'), import('./runs/agent.json')]),
};

export function mount(host, part) {
  if (!PARTS[part]) return null;
  let gone = false;
  let undo = null;
  Promise.all([lazy(PARTS[part]), lazy(() => import('./runs/blog.json'))]).then(([[mod, data], blog]) => {
    if (gone) return;
    undo = mod.draw(host, blog.default, data.default);
  }).catch(() => { /* the fallback stays */ });
  return { destroy() { gone = true; undo?.(); } };
}
