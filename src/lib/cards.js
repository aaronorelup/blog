// The one card shape, read by /ledger/previews.json (the hover card), the short-version box and Start here.
// PREVIEWS.md is the spec. A post with no preview gets only its id and title.
export function cardOf(post) {
  const { id, title, preview } = post.data;
  if (!preview) return { id, title };
  const { verdict, takeaway, points, image, alt, loop } = preview;
  return {
    id,
    title,
    ...(verdict && { verdict }),
    takeaway,
    ...(points.length && { points }),
    ...(image && { image, alt: alt || '' }),
    ...(loop && { loop }),
  };
}
