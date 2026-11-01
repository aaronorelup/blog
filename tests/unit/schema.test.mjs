// The posts schema (src/schemas/post.ts) on a real post's frontmatter: voice is 'claude' on the posts Claude tells as
// "I" (WRITING.md, "Whose voice"), left out on Aaron's, and nothing else.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';

const { data: post } = matter(fs.readFileSync(new URL('../../src/content/posts/bad-very-bad.md', import.meta.url), 'utf8'));
const parse = (data) => collections.posts.schema.safeParse(data);

test("a post's voice is 'claude' or left out, nothing else", () => {
  assert.equal(parse(post).data.voice, 'claude');
  const { voice, ...aarons } = post;
  assert.equal(parse(aarons).data.voice, undefined);
  for (const other of ['aaron', 'Claude', '']) {
    const { error } = parse({ ...post, voice: other });
    assert.deepEqual(error.issues.map((i) => i.path), [['voice']]);
  }
});
