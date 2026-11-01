// <ao-fetch>: HTTP requests the reader sends from their own browser, with the answer shown as it arrives: status,
// the headers that matter, bytes received and time taken. For posts whose claim is what a server does, so the reader
// checks it live instead of trusting a pasted curl. Same-origin only; nothing is sent until a click. A body is
// counted, not kept, and reading stops at cap bytes. Attributes and markup: docs/COMPONENTS.md.

const FETCH_HEADERS = ['content-range', 'content-length', 'accept-ranges', 'content-type'];
// HTTP/2 carries no reason phrase, so res.statusText is empty there; these are the usual ones.
const STATUS_TEXT = { 200: 'OK', 206: 'Partial Content', 304: 'Not Modified', 404: 'Not Found', 416: 'Range Not Satisfiable' };
const fmtBytes = (n) => (n < 10000 ? n.toLocaleString('en-US') + ' bytes'
  : n < 1e6 ? (n / 1000).toFixed(1) + ' KB' : (n / 1e6).toFixed(2) + ' MB');
class AoFetch extends HTMLElement {
  connectedCallback() {
    if (this._ready) return;
    const items = [...this.querySelectorAll(':scope > ol > li[data-url]')];
    if (!items.length) return;
    this._ready = true;
    const cap = parseInt(this.getAttribute('cap') || '2000000', 10);
    const rows = items.map((li) => {
      const url = li.dataset.url;
      let same = false;
      try { same = new URL(url, location.href).origin === location.origin; } catch (e) { /* bad url */ }
      const method = (li.dataset.method || 'GET').toUpperCase();
      const range = li.dataset.range || '';
      const showBody = li.dataset.show === 'body';
      const label = li.textContent.trim();
      li.replaceChildren();
      const head = document.createElement('div');
      head.className = 'ao-fetch-head';
      const name = document.createElement('span');
      name.className = 'ao-fetch-label';
      name.textContent = label;
      const go = document.createElement('button');
      go.type = 'button';
      go.textContent = 'Send it';
      go.disabled = !same;
      head.append(name, go);
      const req = document.createElement('pre');
      req.className = 'ao-fetch-req';
      req.textContent = method + ' ' + url + (range ? '\nRange: ' + range : '');
      const out = document.createElement('pre');
      out.className = 'ao-fetch-out';
      out.setAttribute('aria-live', 'polite');
      out.textContent = same ? 'Not sent yet.' : "Only this site's own files can be requested.";
      li.append(head, req, out);
      let busy = false;
      const run = async () => {
        if (!same || busy) return;
        busy = true;
        go.disabled = true;
        out.textContent = 'Sending…';
        out.classList.remove('ao-fetch-ok', 'ao-fetch-whole');
        const t0 = performance.now();
        const ctl = new AbortController();
        this._ctl = ctl;
        try {
          const headers = range ? { Range: range } : {};
          const res = await fetch(url, { method, headers, cache: 'no-store', signal: ctl.signal });
          const lines = ['HTTP ' + res.status + ' ' + (res.statusText || STATUS_TEXT[res.status] || '')];
          for (const h of FETCH_HEADERS) {
            const v = res.headers.get(h);
            if (v) lines.push(h.replace(/(^|-)\w/g, (m) => m.toUpperCase()) + ': ' + v);
          }
          let got = 0;
          let stopped = false;
          const kept = [];
          if (res.body && method !== 'HEAD') {
            const reader = res.body.getReader();
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (showBody && got < 4096) kept.push(value.slice(0, 4096 - got));
              got += value.byteLength;
              if (got >= cap) { stopped = true; reader.cancel().catch(() => {}); break; }
            }
          }
          if (showBody && kept.length) {
            let text = new TextDecoder().decode(await new Blob(kept).arrayBuffer());
            try { text = JSON.stringify(JSON.parse(text), null, 2); } catch (e) { /* not JSON, or cut short */ }
            lines.push('', text.trimEnd() + (got > 4096 ? '\n…' : ''));
          }
          const ms = Math.round(performance.now() - t0);
          lines.push('');
          lines.push(method === 'HEAD' ? 'No body asked for.'
            : 'Received: ' + fmtBytes(got) + (stopped ? ' (stopped reading here; the server was still sending)' : ''));
          lines.push('Time: ' + ms + ' ms');
          if (range && res.status === 200) lines.push('The Range header was ignored: this is the whole file.');
          out.textContent = lines.join('\n');
          out.classList.add(res.status === 206 || (showBody && !range && res.ok) ? 'ao-fetch-ok' : 'ao-fetch-whole');
        } catch (e) {
          out.textContent = ctl.signal.aborted ? 'Stopped.' : 'The request failed: ' + ((e && e.message) || e);
        } finally {
          busy = false;
          go.disabled = false;
          go.textContent = 'Send it again';
        }
      };
      go.addEventListener('click', run);
      return run;
    });
    if (rows.length > 1) {
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'ao-fetch-all';
      all.textContent = 'Send all ' + rows.length;
      all.addEventListener('click', async () => { for (const run of rows) await run(); });
      this.querySelector(':scope > ol').before(all);
    }
    this.classList.add('ao-fetch-ready');
  }

  disconnectedCallback() {
    // The homepage swaps posts out; don't keep reading a body nobody will see.
    this._ctl?.abort();
  }
}

customElements.define('ao-fetch', AoFetch);
