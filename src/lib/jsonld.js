// schema.org data for a page's head (components/chrome/Head.astro), invisible to readers: one @graph a page, with the
// site's owner as a Person (his profiles as sameAs) beside a listed post's BlogPosting, a notes page's Article, the
// homepage's WebSite or /about/'s ProfilePage. Every value is one the site already states; the repo tracks no
// modified date, so none is claimed. Pure.
import { OWNER, SOCIAL } from '../data/site.js';

const CONTEXT = 'https://schema.org';
const about = (url) => new URL(OWNER.about, url).href;
const ref = (id) => ({ '@id': id });
export const personId = (url) => `${about(url)}#person`;
export const websiteId = (url) => `${new URL('/', url).href}#website`;

// The site's owner, the one node every graph carries. No image: no page of the site shows his portrait.
export const person = (url) =>
  ({ '@type': 'Person', '@id': personId(url), name: OWNER.name, url: about(url), sameAs: SOCIAL.map((s) => s.href) });
const graph = (url, node) => ({ '@context': CONTEXT, '@graph': [node, person(url)] });

// The author is the site's owner, except on a post Claude wrote as "I" (voice: claude): its page says "Written by
// Claude" (post/PostHeader.astro), so its data names no author at all rather than contradict the page. The owner
// still publishes it.
const byline = (url, voice) => ({
  publisher: ref(personId(url)),
  ...(voice === 'claude' ? {} : { author: { '@type': 'Person', '@id': personId(url), name: OWNER.name, url: about(url) } }),
});

// A listed post. url is the page's canonical; image is absolute, and left out when the page has none.
export function blogPosting({ headline, description, published, url, image, voice }) {
  return graph(url, {
    '@type': 'BlogPosting',
    headline,
    description,
    datePublished: published.toISOString(),
    url,
    mainEntityOfPage: url,
    ...(image ? { image } : {}),
    inLanguage: 'en',
    isPartOf: ref(websiteId(url)),
    ...byline(url, voice),
  });
}

// A listed post's notes page (/ledger/<slug>/notes/): an Article, part of its post, by the note's own voice.
export function notesArticle({ headline, description, url, postUrl, voice }) {
  return graph(url, {
    '@type': 'Article', headline, description, url, mainEntityOfPage: url, isPartOf: ref(postUrl), inLanguage: 'en',
    ...byline(url, voice),
  });
}

// /about/: the page about the owner.
export const profilePage = (url) => graph(url, { '@type': 'ProfilePage', url, mainEntity: ref(personId(url)) });

// The homepage. No SearchAction: no page of the site answers a search from a query in its address.
export const webSite = (url) => graph(url,
  { '@type': 'WebSite', '@id': websiteId(url), name: OWNER.name, url, inLanguage: 'en', publisher: ref(personId(url)) });

// The text of a <script type="application/ld+json">. JSON.stringify escapes the quotes, and every "<" is written
// <, which JSON reads back as "<": no title can close the script element or open a comment inside it.
export const scriptText = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
