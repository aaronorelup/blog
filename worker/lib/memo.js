// memo(ms, read): read(env) at most once every ms per isolate, its promise shared by every caller in between. A
// failed read is forgotten, so the next call tries again. The switches (flags.js) and the search index's v use it.
export function memo(ms, read) {
  let last = null; // { at, value }
  return (env) => {
    const now = Date.now();
    if (!last || now - last.at >= ms) {
      const value = read(env);
      value.catch(() => { if (last?.value === value) last = null; });
      last = { at: now, value };
    }
    return last.value;
  };
}
