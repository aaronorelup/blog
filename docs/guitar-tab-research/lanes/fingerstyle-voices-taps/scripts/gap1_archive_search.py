"""Gap round 1: search archive.org for freely licensed recordings of percussive fingerstyle guitar.

One query at a time through archive.org's advancedsearch API (JSON), a pause between queries, a descriptive
User-Agent with no personal details. Writes every hit (identifier, title, mediatype, licenseurl, date, creator,
subject, the first 300 characters of the description) to a JSON file, and prints the hits whose license URL is CC0,
public domain or CC BY (any version, without SA/NC/ND), so they can be looked at by hand.

usage: python3 -I gap1_archive_search.py <out.json>
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request

UA = 'gtr-research-agent/1.0 (guitar tablature research; automated client)'
QUERIES = [
    '"percussive guitar"',
    '"percussive fingerstyle"',
    '"fingerstyle percussion"',
    '"percussive acoustic guitar"',
    '"guitar body percussion"',
    '"body percussion" AND guitar',
    '"slap guitar" OR "guitar slap"',
    'fingerstyle AND (percussive OR percussion OR slap OR tapping)',
    'guitar AND (percussive OR "body tap" OR "body taps" OR "body hit")',
]
FIELDS = ['identifier', 'title', 'mediatype', 'licenseurl', 'date', 'creator', 'subject', 'description']


def free_license(url):
    if not url:
        return False
    u = url.lower()
    if 'publicdomain' in u:
        return True
    return re.search(r'/licenses/by/\d', u) is not None


def main(out):
    hits = {}
    log = []
    for q in QUERIES:
        params = [('q', q), ('rows', '200'), ('page', '1'), ('output', 'json')] + [('fl[]', f) for f in FIELDS]
        url = 'https://archive.org/advancedsearch.php?' + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        t0 = time.time()
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                status = r.status
                data = json.load(r)
        except Exception as e:  # record and go on
            log.append({'query': q, 'error': repr(e)})
            print('ERROR', q, repr(e))
            time.sleep(60)
            continue
        docs = data.get('response', {}).get('docs', [])
        n = data.get('response', {}).get('numFound')
        log.append({'query': q, 'http': status, 'numFound': n, 'returned': len(docs), 'seconds': round(time.time() - t0, 2)})
        print(f'{status} numFound={n} returned={len(docs)}  {q}')
        for d in docs:
            ident = d.get('identifier')
            desc = d.get('description')
            if isinstance(desc, list):
                desc = ' '.join(str(x) for x in desc)
            d['description'] = (desc or '')[:300]
            d.setdefault('queries', [])
            if ident in hits:
                hits[ident]['queries'].append(q)
            else:
                d['queries'] = [q]
                hits[ident] = d
        time.sleep(3)
    with open(out, 'w') as f:
        json.dump({'log': log, 'hits': list(hits.values())}, f, indent=1, ensure_ascii=False)
    free = [h for h in hits.values() if free_license(h.get('licenseurl'))]
    print(f'{len(hits)} distinct items, {len(free)} with a CC0 / public-domain / CC BY license URL:')
    for h in free:
        print('-', h['identifier'], '|', h.get('mediatype'), '|', h.get('licenseurl'), '|', str(h.get('title'))[:90],
              '|', h['description'][:160].replace('\n', ' '))


if __name__ == '__main__':
    main(sys.argv[1])
