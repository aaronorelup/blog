// <ao-funnel>: a total, then what each layer takes out of it, down to what is left: requests down to the ones that
// were people, renders down to the keepers. One bar at the top shows the whole split; each row shows what it took and
// what was left, and opens its examples on request. Negative, positive and "~" values, and the unit attribute:
// docs/COMPONENTS.md. Without JS: the list, with the numbers as written.
import { h } from '../_lib/dom.js';

const funnelNum = (v) => Math.round(v).toLocaleString('en-US');
class AoFunnel extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li')].filter((li) => li.querySelector(':scope > data'));
    if (items.length < 2) return;
    this._ready = true;
    const unit = this.getAttribute('unit') || '';
    const rows = items.map((li) => {
      const data = li.querySelector(':scope > data');
      const value = parseFloat(data.getAttribute('value'));
      const note = h('span', { class: 'ao-funnel-note' });
      for (const node of [...li.childNodes]) {
        if (node.nodeType === 1 && (node.tagName === 'B' || node.tagName === 'DATA' || node.tagName === 'UL')) continue;
        note.append(node.cloneNode(true));
      }
      return {
        label: li.querySelector(':scope > b')?.textContent.trim() || '',
        value,
        approx: /^\s*[~≈]/.test(data.textContent),
        note,
        examples: li.querySelector(':scope > ul'),
      };
    });
    const total = rows[0].value;
    let left = total;
    let rough = false;
    rows.forEach((r, i) => {
      r.before = left;
      if (i === 0) r.left = total;
      else if (r.value < 0) r.left = left + r.value;
      else r.left = r.value;
      r.measured = i > 0 && r.value >= 0;
      r.taken = i === 0 ? 0 : r.before - r.left;
      rough = rough || r.approx;
      r.rough = rough; // this figure, or one it was worked out from, is an estimate
      left = r.left;
    });
    const num = (v, r) => (r.rough ? '~' + funnelNum(Math.round(v / 10) * 10) : funnelNum(v));
    const share = (v) => (v / total < 0.01 ? '<1' : Math.round((v / total) * 100)) + '%';

    const box = h('div', { class: 'ao-funnel-box' });
    const bar = h('div', { class: 'ao-funnel-bar', 'aria-hidden': 'true' });
    const segs = [];
    rows.slice(1).forEach((r, j) => {
      const s = h('span', { class: 'ao-funnel-seg ' + (r.measured ? 'ao-funnel-left is-maybe' : 'ao-funnel-f' + (j % 6)),
        title: (r.measured ? 'Unconfirmed' : r.label) + ': ' + num(r.taken, r) });
      s.style.flexGrow = String(Math.max(0, r.taken));
      bar.append(s);
      segs.push(s);
    });
    const last = rows[rows.length - 1];
    const rest = h('span', { class: 'ao-funnel-seg ao-funnel-left', title: last.label + ': ' + num(left, last) });
    rest.style.flexGrow = String(Math.max(0, left));
    bar.append(rest);
    const sum = h('p', { class: 'ao-funnel-sum', text: funnelNum(total) + (unit ? ' ' + unit : '') + ' → ' + (last.measured
      ? num(last.left, last) + ' to ' + num(last.before, rows[rows.length - 2]) + ' left (' + share(last.left) + ' to ' + share(last.before) + ')'
      : num(left, last) + ' left (' + share(left) + ')') });
    box.append(sum, bar);

    const list = h('ol', { class: 'ao-funnel-rows' });
    rows.forEach((r, i) => {
      const li = h('li', { class: 'ao-funnel-row' + (i === 0 ? ' is-total' : '') });
      if (i > 0) li.classList.add('ao-funnel-f' + ((i - 1) % 6));
      const name = h('b', { text: r.label });
      const nums = h('span', { class: 'ao-funnel-nums' });
      if (i === 0) nums.textContent = funnelNum(total) + (unit ? ' ' + unit : '');
      else if (!r.measured) nums.textContent = (r.approx ? '~' : '') + '−' + funnelNum(r.approx ? Math.round(r.taken / 10) * 10 : r.taken) +
        ' → ' + num(r.left, r) + ' left';
      else nums.textContent = num(r.left, r) + ' of ' + num(r.before, rows[i - 1]) + ', counted another way';
      const head = h('div', { class: 'ao-funnel-head' }, name, nums);
      const keep = h('span', { class: 'ao-funnel-keep' });
      keep.style.width = (r.left / total) * 100 + '%';
      const track = h('div', { class: 'ao-funnel-track', 'aria-hidden': 'true' }, keep);
      if (r.taken > 0) {
        const gone = h('span', { class: 'ao-funnel-gone' + (r.measured ? ' is-maybe' : '') });
        gone.style.left = (r.left / total) * 100 + '%';
        gone.style.width = (r.taken / total) * 100 + '%';
        track.append(gone);
      }
      li.append(head, track, r.note);
      if (r.examples) {
        const more = h('button', { type: 'button', class: 'ao-funnel-more', 'aria-expanded': 'false', text: 'What’s in it', onclick: () => {
          const open = more.getAttribute('aria-expanded') !== 'true';
          more.setAttribute('aria-expanded', String(open));
          ex.hidden = !open;
        } });
        const ex = r.examples.cloneNode(true);
        ex.className = 'ao-funnel-ex';
        ex.hidden = true;
        li.append(more, ex);
      }
      if (i > 0) {
        const seg = segs[i - 1];
        const light = (v) => { seg.classList.toggle('is-on', v); li.classList.toggle('is-on', v); };
        li.addEventListener('pointerenter', () => light(true));
        li.addEventListener('pointerleave', () => light(false));
        li.addEventListener('focusin', () => light(true));
        li.addEventListener('focusout', () => light(false));
        seg.addEventListener('pointerenter', () => light(true));
        seg.addEventListener('pointerleave', () => light(false));
      }
      list.append(li);
    });
    box.append(list);
    this.querySelector(':scope > ol').before(box);
    this.classList.add('ao-funnel-ready');
  }
}

customElements.define('ao-funnel', AoFunnel);
