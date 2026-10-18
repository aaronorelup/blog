// Chapter 04, "When do people come, and is it fast for them?" (DESIGN.md §A.4 04). The answer
// sentence, the Lantern Clock (clock.js) and the page-paint playback (speed.js). It owns the
// routes #/when[/weekdays] and #/speed[/desktop|/mobile], and reads tz (the reader's clock or
// UTC) from the store, so ?tz=utc in a link turns the dial.
import '../../../styles/stats/rhythm.css';
import * as g from './geom.js';
import { mountClock } from './clock.js';
import * as fmt from '../core/fmt.js';

const DEV_ON = { desktop: 'on a computer', mobile: 'on a phone' };

export async function mount(el, ctx) {
  const answer = el.querySelector('[data-st-answer]');
  const context = el.querySelector('[data-st-context]');
  const body = el.querySelector('[data-st-body]') || el.appendChild(document.createElement('div'));
  const follow = el.querySelector('[data-st-follow]');
  body.textContent = '';
  body.classList.add('st-rhy');
  if (context) context.hidden = true;

  // The playback is its own chunk, fetched as soon as the chapter mounts, so the clock (the
  // first thing a reader scrolls to) doesn't wait for the speed figure's code (DESIGN §G.1).
  const speedMod = import('./speed.js');

  // The chapter's one polite live region: the clock's readout and the feel-it taps both speak
  // through it, so a screen reader hears one voice per chapter (DESIGN §G.2).
  const live = document.createElement('span');
  live.className = 'st-sr';
  live.setAttribute('aria-live', 'polite');
  body.append(live);
  const say = (text) => { live.textContent = text; };

  const clock = mountClock(body, ctx, say);
  const fu = ctx.ui?.followups;
  (typeof fu === 'function' ? fu : fu?.followups)?.(follow, [
    { label: 'Where are they?', href: '#/where' },
    { label: 'Is it fast on a phone?', href: '#/speed/mobile' },
    { label: 'How was this counted?', href: '#/how' },
  ]);

  const term = (key, label) => {
    try { if (ctx.ui?.term?.term && ctx.words?.TERMS?.[key]) return ctx.ui.term.term(key, label); } catch (e) { /* plain text */ }
    return label;
  };

  // "People read most around 8 pm your time and least around 4 am. Fast. Three visits in four
  // saw the main content within 0.68 s on a computer and 0.8 s on a phone."
  function writeAnswer(view, c) {
    if (!answer) return;
    const parts = [];
    if (c.total < 24) {
      parts.push(`Too few of people's pages ${view.phrase?.long || 'in this range'} (${fmt.num(c.total)}) to say when they come.`);
    } else {
      const where = c.readerIsUTC || c.utc ? ' UTC' : ' your time';
      parts.push(`People read most around ${c.peak}${where} and least around ${c.quiet}${c.utc && !c.readerIsUTC ? ' UTC' : ''}.`);
    }
    const V = ctx.snap?.vitals;
    const lead = g.speedLead(V);
    if (lead) {
      const live = ['desktop', 'mobile'].filter((k) => V[k] && V[k].n > 0);
      const within = live.map((k) => `${fmt.secs(V[k].lcp)} ${DEV_ON[k]}`);
      parts.push(' ', { b: lead }, ' ', term('p75', 'Three visits in four'), ' saw ', term('lcp', 'the main content'),
        ` within ${fmt.list(within)}.`);
    }
    // built by hand rather than through ui/sentence: nothing here tweens, and the terms are
    // real buttons that sentence() would otherwise have to know about
    answer.textContent = '';
    for (const p of parts) {
      if (typeof p === 'string') answer.append(p);
      else if (p && p.b) { const b = document.createElement('strong'); b.textContent = p.b; answer.append(b); }
      else if (p) answer.append(p);
    }
  }

  const keyOf = (r) => (ctx.agg?.rangeKey ? ctx.agg.rangeKey(r) : JSON.stringify(r));
  const draw = (s, prev) => {
    const view = ctx.views.get(s.range);
    const rangeChanged = !prev || keyOf(s.range) !== keyOf(prev.range);
    const c = clock.render(view, s.tz, { animateTz: !!prev && prev.tz !== s.tz, rangeChanged });
    writeAnswer(view, c);
  };
  // The clock's first draw comes before the await below: it gives the clock its data, so its
  // grow-on-enter has something to grow even when the figure is on screen before speed.js lands.
  draw(ctx.store.get(), null);
  const speed = (await speedMod).mountSpeed(body, ctx, say);

  // The pop closes on a scroll of more than 24px, and a routed playback should start where the
  // reader can see it, so both wait for the scroll to land: the scroller's position unchanged
  // for two looks 100 ms apart (a long smooth scroll takes well over a second), or 3 s at most.
  //
  // "Landed" can be the next route's scroll, though: a reader who follows #/speed/mobile and
  // presses Back half a second later is carried back up, and when that scroll stops the card
  // would open over the machines chapter. So a wait belongs to one route. Any route the page
  // takes after it (the bus hears every one, ours included, before go() runs) drops what is
  // still waiting, and the callback itself checks the address still says this route.
  const timers = new Set();
  const cancel = () => { timers.forEach((t) => clearInterval(t)); timers.clear(); };
  const afterScroll = (route, fn) => {
    const root = ctx.scrollRoot || document.getElementById('panel-scroll');
    const here = () => {
      const r = ctx.router?.current?.();
      return !r || (r.ch === route.ch && (r.sub || null) === (route.sub || null));
    };
    let last = -1, still = 0, n = 0;
    const iv = setInterval(() => {
      const top = root ? root.scrollTop : 0;
      still = top === last ? still + 1 : 0;
      last = top;
      if (still >= 2 || ++n > 30) { clearInterval(iv); timers.delete(iv); if (here()) fn(); }
    }, 100);
    timers.add(iv);
  };
  const offRoute = ctx.bus?.on?.('route', cancel);

  return {
    update(s, prev) {
      if (keyOf(s.range) === keyOf(prev.range) && s.tz === prev.tz) return;
      draw(s, prev);
    },
    go(route) {
      cancel();
      const r = { ch: route.ch, sub: route.sub || null };
      if (r.ch === 'when' && r.sub === 'weekdays') afterScroll(r, () => clock.pulseWeekdays());
      if (r.ch === 'speed') {
        afterScroll(r, () => {
          if (speed.state !== 'playing') speed.play(true);
          if (r.sub === 'desktop' || r.sub === 'mobile') speed.openCard(r.sub);
        });
      }
    },
    onMode() { /* every colour is a CSS variable, so the marks follow the mode by themselves */ },
    destroy() {
      cancel();
      offRoute?.();
      clock.destroy();
      speed.destroy();
      live.remove();
    },
  };
}
