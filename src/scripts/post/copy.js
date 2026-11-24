// A Copy button on every code block of a post or notes page (a fenced block, not a <pre> inside a post component:
// <ao-ask> has its own). The <pre> is wrapped in .code-block and the button sits beside it, outside the code, so the
// code's text, its scrolling and the built HTML stay as they were; data-pagefind-ignore keeps the button's label out
// of the text highlight.js walks. The button says Copied for a moment; where the clipboard is refused it selects the
// code instead, for the reader to copy. mount(root) returns unmount.
const SAID_FOR = 1800;    // ms "Copied" stays
const LABEL = 'Copy';

const inComponent = (el, root) => {
  for (let n = el.parentElement; n && n !== root; n = n.parentElement) if (n.localName.startsWith('ao-')) return true;
  return false;
};

export function mount(root) {
  for (const pre of root.querySelectorAll('pre')) {
    if (inComponent(pre, root) || pre.parentElement.classList.contains('code-block')) continue;
    const box = document.createElement('div');
    box.className = 'code-block';
    pre.before(box);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.dataset.pagefindIgnore = '';
    button.setAttribute('aria-label', 'Copy this code');
    button.textContent = LABEL;
    box.append(pre, button);
  }
  const timers = new Map();
  const say = (button, text) => {
    button.textContent = text;
    clearTimeout(timers.get(button));
    timers.set(button, setTimeout(() => { button.textContent = LABEL; }, SAID_FOR));
  };
  const click = async (e) => {
    const button = e.target.closest('.code-copy');
    if (!button || !root.contains(button)) return;
    const pre = button.parentElement.querySelector('pre');
    try {
      await navigator.clipboard.writeText(pre.textContent.replace(/\s+$/, ''));
      say(button, 'Copied');
    } catch {
      getSelection().selectAllChildren(pre);
      say(button, 'Selected: copy it');
    }
  };
  root.addEventListener('click', click);
  return () => {
    root.removeEventListener('click', click);
    for (const t of timers.values()) clearTimeout(t);
  };
}
