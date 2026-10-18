// Every chart on the page has a real table behind it: always in the DOM for screen readers,
// visually hidden until the reader asks for "Show the numbers". Under each figure a quiet row of
// tools: show the numbers, copy a link to exactly this view, copy the table as CSV.
import { num } from '../core/fmt.js';

let uid = 0;

/**
 * @param {{caption:string, cols:Array<{key:string,label:string,num?:boolean,fmt?:(v:any)=>string}>, rows:object[]}} spec
 * @returns {{el:HTMLTableElement, csv:()=>string, update:(spec)=>void}}
 */
export function tableTwin(spec) {
  const el = document.createElement('table');
  el.className = 'st-table st-sr';
  el.id = 'st-table-' + ++uid;
  // Explicit roles, because on a phone the shown table is laid out as stacked rows (base.css), and
  // a table whose display isn't `table` loses its table meaning in some screen readers.
  el.setAttribute('role', 'table');
  let cur = spec;
  function draw() {
    const { caption, cols, rows } = cur;
    const cap = document.createElement('caption');
    cap.textContent = caption || '';
    const thead = document.createElement('thead');
    thead.setAttribute('role', 'rowgroup');
    const hr = document.createElement('tr');
    hr.setAttribute('role', 'row');
    for (const c of cols) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.setAttribute('role', 'columnheader');
      th.textContent = c.label;
      if (c.num) th.className = 'is-num';
      hr.append(th);
    }
    thead.append(hr);
    const tbody = document.createElement('tbody');
    tbody.setAttribute('role', 'rowgroup');
    for (const r of rows || []) {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      cols.forEach((c, i) => {
        const td = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) { td.scope = 'row'; td.setAttribute('role', 'rowheader'); }
        else {
          td.setAttribute('role', 'cell');
          // the column's name, printed before the value when the row is a stacked card
          td.dataset.label = c.label;
        }
        const v = r[c.key];
        td.textContent = c.fmt ? c.fmt(v, r) : c.num && typeof v === 'number' ? num(v) : v == null ? '' : String(v);
        if (c.num) td.className = 'is-num';
        tr.append(td);
      });
      tbody.append(tr);
    }
    el.replaceChildren(cap, thead, tbody);
  }
  draw();
  const q = (s) => {
    const t = String(s ?? '');
    return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  };
  return {
    el,
    csv() {
      const { cols, rows } = cur;
      const lines = [cols.map((c) => q(c.label)).join(',')];
      for (const r of rows || []) lines.push(cols.map((c) => q(r[c.key])).join(','));
      return lines.join('\n') + '\n';
    },
    update(next) { cur = { ...cur, ...next }; draw(); },
  };
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch (e) { /* fall through to the old way */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

function toolBtn(label) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'st-tool';
  b.textContent = label;
  return b;
}

function flash(b, text) {
  const was = b.dataset.label || b.textContent;
  b.dataset.label = was;
  b.textContent = text;
  clearTimeout(b._t);
  b._t = setTimeout(() => { b.textContent = was; }, 1600);
}

/**
 * The quiet tools row under a figure. `table` is a tableTwin(); it is placed right after the row
 * if it isn't in the page yet. `route` is the Route this figure lives at (for Copy link).
 */
export function figureTools(container, { table, route, router, csv = true } = {}) {
  const row = document.createElement('div');
  row.className = 'st-tools';
  const btns = [];
  if (table) {
    const show = toolBtn('Show the numbers');
    show.setAttribute('aria-expanded', 'false');
    show.setAttribute('aria-controls', table.el.id);
    show.addEventListener('click', () => {
      const hidden = table.el.classList.toggle('st-sr');
      show.textContent = hidden ? 'Show the numbers' : 'Hide the numbers';
      show.dataset.label = show.textContent;
      show.setAttribute('aria-expanded', hidden ? 'false' : 'true');
    });
    btns.push(show);
  }
  if (route && router) {
    const link = toolBtn('Copy link');
    link.addEventListener('click', async () => {
      const ok = await copyText('https://aaronorelup.com/stats' + router.href(route));
      flash(link, ok ? 'Copied' : 'Copy failed');
    });
    btns.push(link);
  }
  if (table && csv) {
    const c = toolBtn('Copy as CSV');
    c.addEventListener('click', async () => {
      const ok = await copyText(table.csv());
      flash(c, ok ? 'Copied' : 'Copy failed');
    });
    btns.push(c);
  }
  row.append(...btns);
  container.append(row);
  if (table && !table.el.isConnected) row.after(table.el);
  return { destroy() { row.remove(); } };
}
