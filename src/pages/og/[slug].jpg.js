// /og/<slug>.jpg: each listed post's share card (lib/og/image.js). A post whose card failed to draw has no file here:
// it shares /og/default.jpg.
import { listedPosts, slugOf } from '../../lib/content.js';
import { ogImage } from '../../lib/og/image.js';

export async function getStaticPaths() {
  const posts = await listedPosts();
  const cards = await Promise.all(posts.map(ogImage));
  return posts.filter((_, i) => cards[i].jpg).map((post) => ({ params: { slug: slugOf(post) }, props: { post } }));
}

export async function GET({ props }) {
  return new Response((await ogImage(props.post)).jpg, { headers: { 'Content-Type': 'image/jpeg' } });
}
