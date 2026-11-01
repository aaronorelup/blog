// h(): an element, its attributes and its children in one call, for the elements that build their own markup.
//   h('button', { type: 'button', class: 'ao-x-go', 'aria-label': 'Play', onclick: go }, 'Play')
// class sets className, text textContent, style the inline CSS, on<event> adds a listener, true is an empty
// attribute. null, undefined and false are left out, as attributes and as children; a child may be an array.
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c);
  return el;
}
