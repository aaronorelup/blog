// /og/page/<name>.jpg: the share card of each listed page that isn't a post (lib/og/pages.js).
import { pageImage } from '../../../lib/og/image.js';
import { sharePages } from '../../../lib/og/pages.js';

export async function getStaticPaths() {
  return [...(await sharePages()).values()].map((page) => ({ params: { name: page.name }, props: { page } }));
}

export async function GET({ props }) {
  return new Response((await pageImage(props.page)).jpg, { headers: { 'Content-Type': 'image/jpeg' } });
}
