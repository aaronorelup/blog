// The ledger's chips (components/ledger/Chips.astro): one topic or project at a time hides the other rows and any
// month left empty; the active chip again, or All, shows everything. The chips are links, so the filter reads the
// query string on load and keeps it in step with replaceState, leaving any other parameter as it was.
const KEYS = ['topic', 'project'];

export function mount(root) {
  const chips = [...root.querySelectorAll('[data-chip]')];
  const months = [...root.querySelectorAll('[data-month]')];
  const rows = months.flatMap((m) => [...m.querySelectorAll('.row')]);

  const matches = (row, key, value) => (key === 'topic' ? row.dataset.topic === value
    : row.dataset.project.split(' ').includes(value));
  // A value no chip names (a hand-made address) filters nothing.
  const show = (params) => {
    const key = KEYS.find((k) => params.has(k));
    const on = chips.find((c) => c.dataset.chip === (key ?? '') && c.dataset.value === (params.get(key) ?? ''))
      ?? chips.find((c) => !c.dataset.chip);
    for (const c of chips) if (c === on) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current');
    for (const r of rows) r.hidden = !!on.dataset.chip && !matches(r, on.dataset.chip, on.dataset.value);
    for (const m of months) m.hidden = !m.querySelector('.row:not([hidden])');
  };

  const onClick = (e) => {
    const chip = e.target.closest('[data-chip]');
    if (!chip || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const url = new URL(location.href);
    KEYS.forEach((k) => url.searchParams.delete(k));
    if (chip.dataset.chip && !chip.hasAttribute('aria-current')) url.searchParams.set(chip.dataset.chip, chip.dataset.value);
    history.replaceState(history.state, '', url);
    show(url.searchParams);
  };

  root.addEventListener('click', onClick);
  show(new URLSearchParams(location.search));
  return () => root.removeEventListener('click', onClick);
}
