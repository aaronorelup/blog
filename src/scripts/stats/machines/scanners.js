// The locked doors: every address a scanner tried that this site never had, drawn as a wall of
// doors grouped by what the knockers hoped to find (WordPress setup pages, password files, code
// history…). A door's bar is its knocks on one scale for the whole wall, so the busiest door is
// the full width of its tile and every other door is measured against it.
//
// The first time the shelf is shown, the six most-knocked doors shake twice: knocking. Never
// again in the visit, and never under reduced motion.
//
// Counts here are files ("knocks"), because a scanner asks for files, not pages.
import { h, clear, prose, animate, pathNode } from './dom.js';
import { doorWall, middleTruncate, statusSplit, topPlaces, isSitePath } from './model.js';

const NOT_FOUND = '‘not found’';
const FORBIDDEN = '‘forbidden’';

export function createScanners(root, api, tab) {
  const { fmt } = api;
  let view = null;
  let wall = null;
  let knocked = false;

  function render(v) {
    view = v;
    clear(root);
    root.append(h('p', { class: 'st-mach-eyebrow' }, tab.eyebrow));
    const knocks = view.files.scanner || 0;
    if (!knocks) {
      root.append(prose('st-mach-sent', [`Nobody tried the wrong doors ${view.phrase.long}. Enjoy it.`]));
      wall = null;
      return;
    }
    const st = statusSplit(view.probeStatus);
    // The tab counts pages and this shelf counts knocks (files), so "Scanners 326" sat beside
    // "knocked 14,485 times" as if one of them were wrong. The sentence says how the two meet.
    // "Mostly": the wall holds every address tried, whatever the answer, and a few were real.
    const pages = view.pages.scanner || 0;
    root.append(prose('st-mach-sent', [
      `Scanners knocked ${fmt.num(knocks)} ${knocks === 1 ? 'time' : 'times'}, mostly on doors this site never had. `,
      pages > 0
        ? `Only ${fmt.num(pages)} of those knocks asked for a page; the rest asked for files. `
        : 'None of them asked for a page; they all asked for files. ',
      st.n403 > 0
        ? `${fmt.num(st.n404)} got ${NOT_FOUND} and ${fmt.num(st.n403)} ${FORBIDDEN}.`
        : `${fmt.num(st.n404)} got ${NOT_FOUND}.`,
    ]));
    root.append(prose('st-mach-note', [
      // Until 17 Oct 2026 the site had only /favicon.svg, so earlier days hold browsers asking for
      // /favicon.ico by habit. It has one now, so the line names the habit, not a missing file.
      'A person following a broken link lands here too, and so does a browser asking by habit for an icon the site didn’t have.',
    ]));

    // a phone gets one row of three doors per family, so the wall is a wall and not a corridor
    const narrow = window.matchMedia && window.matchMedia('(max-width: 560px)').matches;
    wall = doorWall(view.probes, knocks, api.famOf, 24, narrow ? 3 : 6);
    // Each day's filing keeps only its 25 busiest doors, so over several days most door counts
    // are floors. Said once, here, rather than "at least" under every door.
    const doors = wall.groups.flatMap((g) => g.doors);
    wall.mostPartial = doors.filter((x) => x.partial).length > doors.length / 2;
    if (wall.mostPartial) {
      root.append(prose('st-mach-note', ['Each day’s filing keeps only its 25 busiest doors, so the counts under the doors are the least each one got.']));
    }
    const wallEl = h('div', { class: 'st-mach-wall' });
    for (const g of wall.groups) {
      const ul = h('ul', { class: 'st-mach-doors', 'aria-label': g.fam.name });
      for (const d of g.doors) ul.append(h('li', null, door(d, st, knocks)));
      wallEl.append(h('section', { class: 'st-mach-fam' },
        h('h4', { class: 'st-mach-famname' }, g.fam.name, h('span', { class: 'st-mach-famn' }, ` · ${fmt.num(g.n)} ${g.n === 1 ? 'knock' : 'knocks'}`)),
        ul,
        g.hidden > 0
          ? h('p', { class: 'st-mach-famrest' }, `and ${fmt.num(g.hidden)} more ${g.hidden === 1 ? 'door' : 'doors'} like these (${fmt.num(g.hiddenN)} ${g.hiddenN === 1 ? 'knock' : 'knocks'})`)
          : null));
    }
    root.append(wallEl);
    // the family totals above already hold their "more doors like these"; this is only the rest
    if (wall.beyond > 0) {
      root.append(prose('st-mach-note', [`Plus about ${fmt.num(wall.beyond)} knocks on doors not counted above, mostly ones below each day’s 25 busiest.`]));
    }

    const places = topPlaces(view.probeCountries);
    if (places.length) {
      root.append(prose('st-mach-where', [
        'Knocks came mostly from ',
        places.map((p, i) => [i ? ' · ' : '', fmt.countryIn(p.code), ' ', h('b', { class: 'st-mach-n' }, fmt.num(p.n))]),
        '. Scanners run on rented servers, so this is where the server was, not a person. ',
        h('a', { class: 'st-mach-link', href: '#/where/scanners' }, 'On the map →'),
      ]));
    }

    const tableRows = [];
    for (const g of wall.groups) for (const d of g.doors) tableRows.push({ door: d.path, family: g.fam.name, knocks: d.n, partial: d.partial ? 'at least' : '' });
    if (wall.remainder > 0) tableRows.push({ door: 'Doors not shown', family: '', knocks: wall.remainder, partial: 'about' });
    const tools = h('div', { class: 'st-mach-figtools' });
    root.append(tools);
    api.tools(tools, `Scanner knocks ${view.phrase.long}, by door`, [
      { key: 'door', label: 'Door' }, { key: 'family', label: 'What it is' },
      { key: 'knocks', label: 'Knocks', num: true }, { key: 'partial', label: 'Note' },
    ], tableRows, null);
  }

  function door(d, st, knocks) {
    const w = wall.top ? d.n / wall.top : 0;
    const famName = d.fam.name;
    const btn = h('button', {
      type: 'button', class: 'st-mach-door', 'aria-haspopup': 'dialog', dataset: { rank: d.rank },
      'aria-label': `${d.path}, ${d.partial ? 'at least ' : ''}${fmt.num(d.n)} ${d.n === 1 ? 'knock' : 'knocks'}, ${famName}`,
      onclick: (e) => doorCard(btn, d, st, knocks, e),
    },
    h('span', { class: 'st-mach-doorart', 'aria-hidden': 'true' }, h('span', { class: 'st-mach-knocker' })),
    h('span', { class: 'st-mach-doorpath', title: d.path }, pathNode(middleTruncate(d.path, 30))),
    // "at least" is said once for the whole wall when most doors are partial (see render)
    h('span', { class: 'st-mach-doorn' }, d.partial && !wall.mostPartial ? h('span', { class: 'st-mach-atleast' }, 'at least ') : null, fmt.num(d.n)),
    h('span', { class: 'st-mach-doorbar', 'aria-hidden': 'true' }, h('span', { style: { width: (w * 100).toFixed(1) + '%' } })));
    return btn;
  }

  function doorCard(anchor, d, st, knocks, ev) {
    const n = (d.partial ? 'At least ' : '') + fmt.num(d.n);
    let title, body;
    if (d.fam.key === 'habit') {
      const ask = d.n === 1 ? 'ask' : 'asks';
      title = `${n} ${ask} for ${d.path}.`;
      body = d.path === '/favicon.ico'
        ? 'Not a scanner at all: browsers ask for this by habit. Until 17 Oct 2026 the site had only /favicon.svg, so these got ' + NOT_FOUND + '. It has a /favicon.ico now.'
        : 'Not a scanner at all: phones ask for a home-screen icon by habit. This site doesn’t have one, so they get ' + NOT_FOUND + '.';
    } else if (isSitePath(d.path, api.ctx.build)) {
      // a real file of this site on the wall: whatever went wrong, it wasn't 'not found'
      title = `${n} ${d.n === 1 ? 'knock' : 'knocks'} on ${d.path}.`;
      body = 'This one is real: the site serves ' + d.path + '. These knocks failed some other way, a method it doesn’t take or a connection dropped before the answer.';
    } else {
      title = `${n} ${d.n === 1 ? 'knock' : 'knocks'} on ${d.path}.`;
      const hoped = d.fam.hoped ? 'What they hoped to find: ' + d.fam.hoped + ' ' : '';
      const house = d.fam.house ? d.fam.house + ' ' : '';
      // there's no answer per door, only the split for every knock, so the card says what most got
      const answer = st.n404 > knocks / 2 ? 'Most knocks like this one got ' + NOT_FOUND + '.' : '';
      body = (hoped + house + answer).trim();
    }
    api.card(anchor, { title, body: [body], meta: d.fam.name }, `${d.path}: ${d.fam.name}`, ev);
  }

  // two quick knocks on the six busiest doors, 80 ms apart by rank
  function knock() {
    if (knocked || !wall || api.reduced()) return;
    knocked = true;
    root.querySelectorAll('.st-mach-door').forEach((btn) => {
      const rank = +btn.dataset.rank;
      if (!(rank < 6)) return;
      const art = btn.querySelector('.st-mach-doorart');
      animate(art, [
        { transform: 'translateX(0)' }, { transform: 'translateX(-1.5px)' }, { transform: 'translateX(1.5px)' }, { transform: 'translateX(0)' },
      ], { duration: 120, iterations: 2, delay: 260 + rank * 80, easing: 'linear' }, false);
    });
  }

  return {
    render,
    go() {},
    shown() { knock(); },
    destroy() { clear(root); },
  };
}
