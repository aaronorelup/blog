// schema.org data for a page's head (components/chrome/Head.astro), invisible to readers: a listed post is a
// BlogPosting, the homepage the WebSite. Every value is one the page already states in its title, description,
// canonical, og:image and article:published_time; the repo tracks no modified date, so none is claimed. Pure.
import { OWNER } from '../data/site.js';

const CONTEXT = 'https://schema.org';

// A listed post. url is the page's canonical; image is absolute, and left out when the page has none. The author is
// the site's owner, except on a post Claude wrote as "I" (voice: claude): its page says "Written by Claude"
// (post/PostHeader.astro), so its data names no author at all rather than contradict the page.
export function blogPosting({ headline, description, published, url, image, voice }) {
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline,
    description,
    datePublished: published.toISOString(),
    url,
    mainEntityOfPage: url,
    ...(image ? { image } : {}),
    ...(voice === 'claude' ? {} : { author: { '@type': 'Person', name: OWNER.name, url: new URL(OWNER.about, url).href } }),
  };
}

// The homepage. No SearchAction: no page of the site answers a search from a query in its address.
export const webSite = (url) => ({ '@context': CONTEXT, '@type': 'WebSite', name: OWNER.name, url });

// The text of a <script type="application/ld+json">. JSON.stringify escapes the quotes, and every "<" is written
// <, which JSON reads back as "<": no title can close the script element or open a comment inside it.
export const scriptText = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
