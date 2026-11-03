// The posts schema (src/schemas/post.ts): voice is 'claude' on the posts Claude tells as "I" (WRITING.md, "Whose
// voice"), left out on Aaron's, and nothing else; every post passes it with the strict rules; STRICT's rollout.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import matter from 'gray-matter';
import { collections } from './content-schema.mjs';
import { isHeld, isLive } from '../../src/data/exempt.js';
import { STRICT, v2Rules } from '../../src/schemas/strict.js';

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

// Every post the build reads, through the schema and the strict rules (src/schemas/strict.js), whatever STRICT says:
// a late post that breaks one fails npm test even while the deploy build only prints it. Live notebooks are the
// fleet's (types only); HELD posts wait for Aaron.
const dir = new URL('../../src/content/posts/', import.meta.url);
const posts = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
  .map((f) => ({ file: f, data: matter(fs.readFileSync(new URL(f, dir), 'utf8')).data }));

test('every post meets the content model, the strict rules included', () => {
  for (const { file, data } of posts.filter((p) => !isLive(p.data.id))) {
    const issues = (parse(data).error?.issues ?? []).map((i) => `${i.path.join('.')}: ${i.message}`);
    if (!isHeld(data.id)) v2Rules(data, (key, message) => issues.push(`${key}: ${message}`));
    for (const key of ['series', 'status', 'tags']) if (key in data) issues.push(`${key}: a v1 field`);
    assert.deepEqual(issues, [], file);
  }
});

test('until STRICT, the build takes a post that breaks only a strict rule; once on, it refuses it', () => {
  const { topic, ...late } = post;
  for (const data of [late, { ...post, preview: { ...post.preview, verdict: undefined } }]) {
    assert.equal(parse(data).success, !STRICT);
    const found = [];
    v2Rules(data, (key) => found.push(key));
    assert.equal(found.length, 1);
  }
});
