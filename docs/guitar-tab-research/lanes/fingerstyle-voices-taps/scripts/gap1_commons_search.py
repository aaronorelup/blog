"""Gap round 1: search Wikimedia Commons (File namespace) for recordings of percussive guitar.

One API request at a time, 5 s between requests, 60 s after an HTTP 429, a descriptive User-Agent with no personal
details. For every file found: size, duration, MIME type, license short name and URL, artist, and the first 300
characters of the description (from the API's extmetadata). Writes JSON and prints the audio and video files.

usage: python3 -I gap1_commons_search.py <out.json>
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = 'gtr-research-agent/1.0 (guitar tablature research; automated client)'
API = 'https://commons.wikimedia.org/w/api.php'
QUERIES = [
    'percussive guitar',
    'percussive fingerstyle',
    'fingerstyle percussion',
    'guitar body percussion',
    'slap guitar acoustic',
    'guitar body tapping',
    'percussive acoustic guitar',
    'fingerstyle guitar',
]


def get(params):
    url = API + '?' + urllib.parse.urlencode(params)
    for attempt in range(2):
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt == 0:
                print('HTTP 429, waiting 60 s', file=sys.stderr)
                time.sleep(60)
                continue
            return e.code, None
    return None, None


def strip(html):
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', html or '')).strip()


def main(out):
    log, files = [], {}
    for q in QUERIES:
        status, data = get({'action': 'query', 'list': 'search', 'srsearch': q, 'srnamespace': 6,
                            'srlimit': 50, 'format': 'json'})
        hits = [h['title'] for h in (data or {}).get('query', {}).get('search', [])]
        log.append({'query': q, 'http': status, 'hits': len(hits)})
        print(status, len(hits), q)
        for t in hits:
            files.setdefault(t, {'title': t, 'queries': []})['queries'].append(q)
        time.sleep(5)
    titles = [t for t in files if re.search(r'\.(ogg|oga|ogv|webm|wav|flac|mp3|opus|mid|mpg|mpeg)$', t, re.I)]
    for i in range(0, len(titles), 20):
        chunk = titles[i:i + 20]
        status, data = get({'action': 'query', 'titles': '|'.join(chunk), 'prop': 'imageinfo',
                            'iiprop': 'size|mime|url|extmetadata|mediatype', 'format': 'json'})
        log.append({'imageinfo_chunk': i, 'http': status})
        for page in (data or {}).get('query', {}).get('pages', {}).values():
            ii = (page.get('imageinfo') or [{}])[0]
            em = ii.get('extmetadata', {})
            files[page['title']].update({
                'size': ii.get('size'), 'duration': ii.get('duration'), 'mime': ii.get('mime'),
                'width': ii.get('width'), 'height': ii.get('height'), 'url': ii.get('url'),
                'descriptionurl': ii.get('descriptionurl'),
                'license': em.get('LicenseShortName', {}).get('value'),
                'license_url': em.get('LicenseUrl', {}).get('value'),
                'artist': strip(em.get('Artist', {}).get('value')),
                'description': strip(em.get('ImageDescription', {}).get('value'))[:300],
            })
        time.sleep(5)
    with open(out, 'w') as f:
        json.dump({'log': log, 'files': list(files.values())}, f, indent=1, ensure_ascii=False)
    for t in titles:
        x = files[t]
        print('-', t, '|', x.get('mime'), '|', x.get('duration'), 's |', x.get('size'), 'B |', x.get('license'), '|',
              x.get('artist', '')[:40], '|', x.get('description', '')[:150])


if __name__ == '__main__':
    main(sys.argv[1])
