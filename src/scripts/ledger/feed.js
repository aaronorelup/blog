// The feed's copy button under the ledger: the feed's address goes on the clipboard, and the button says so for a
// moment. (The homepage's scene binds the same button in its overlay until T3.2 deletes that copy.)
const SAID_FOR = 1800;    // ms "copied" stays

export function bindFeedCopy(root) {
  const btn = root.querySelector('#feed-copy');
  let t = 0;
  const copy = () => navigator.clipboard.writeText(location.origin + '/rss.xml').then(() => {
    btn.textContent = 'copied';
    clearTimeout(t);
    t = setTimeout(() => { btn.textContent = 'copy'; }, SAID_FOR);
  }, () => {});
  btn.addEventListener('click', copy);
  return () => btn.removeEventListener('click', copy);
}
