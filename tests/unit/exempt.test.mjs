// src/data/exempt.js is asked by every rule, so it must match a live notebook by its id, its slug and each path its
// fleet writes, however the path is spelled, and nothing that only looks like one: an exemption that reached too far
// would switch the checks off for someone else's post. The same for the HELD posts, and for the media that stay in
// git (scripts/media/files.mjs). live.test.mjs and live-checker.test.mjs hold what the exemption then lets through.
import assert from 'node:assert/strict';
import test from 'node:test';
import { HELD, isHeld, isLive, isLivePath, LIVE_NOTEBOOKS } from '../../src/data/exempt.js';
import { belongsInR2, STAYS_IN_GIT, typeOf } from '../../scripts/media/files.mjs';

test('isLive: a live notebook by its id or its slug, exactly', () => {
  for (const [id, { slug }] of Object.entries(LIVE_NOTEBOOKS)) {
    assert.ok(isLive(id) && isLive(slug));
    for (const near of [id + '0', id.slice(0, -1), id.toLowerCase(), ` ${id}`, slug + '-2', `my-${slug}`, slug.toUpperCase()]) {
      assert.equal(isLive(near), false, near);
    }
  }
  for (const other of ['AO-001', 'earthlight', '', undefined, null]) assert.equal(isLive(other), false, String(other));
});

test('isLivePath: every path the fleet writes, repo-relative, dist-relative, as a URL path or a full URL', () => {
  for (const { paths } of Object.values(LIVE_NOTEBOOKS)) {
    for (const p of paths) {
      assert.match(p, /^(src|public|dist)\//);
      for (const spelled of [p, '/' + p, p + (p.endsWith('/') ? 'deeper/file.webp' : ''), p.replace(/^(public|dist)\//, '/'),
        'https://aaronorelup.com/' + p.replace(/^(public|dist)\//, '')]) assert.equal(isLivePath(spelled), true, spelled);
    }
  }
  for (const p of ['src/content/posts/teardown-lab.md', 'public/media/teardown-lab/a/b.webp', '/media/teardown-lab/clip.mp4', 'public/labs/teardown/lander/index.html',
    '/labs/teardown/', 'dist/ledger/teardown-lab/index.html', 'https://aaronorelup.com/ledger/teardown-lab/']) assert.equal(isLivePath(p), true, p);
});

test('isLivePath: nothing that only looks like a live path', () => {
  for (const p of ['src/content/posts/earthlight.md', 'src/content/posts/teardown-lab-two.md', 'src/content/posts/my-teardown-lab.md',
    '/media/teardown-lab-two/x.webp', '/media/earthlight/teardown-lab.webp', '/labs/teardown-two/', '/labs/', '/ledger/teardown-lab-two/', '/ledger/teardown/',
    '/ledger/', '/', '', 'src/data/exempt.js', 'worker/index.js']) assert.equal(isLivePath(p), false, p);
});

test('isHeld: a held post by its id or its slug, and a held post is not a live notebook', () => {
  for (const [id, slug] of Object.entries(HELD)) {
    assert.ok(isHeld(id) && isHeld(slug));
    assert.equal(isHeld(slug + '-2'), false);
    assert.equal(isLive(id) || isLive(slug), false);
  }
  for (const { slug } of Object.values(LIVE_NOTEBOOKS)) assert.equal(isHeld(slug), false);
  for (const other of ['AO-001', 'earthlight', '', undefined]) assert.equal(isHeld(other), false, String(other));
});

test('video and audio belong in R2, except in the folders other repos and the fleet write', () => {
  assert.equal(typeOf('/media/a/clip.MP4'), 'video/mp4');
  assert.equal(typeOf('/media/a/song.mp3'), 'audio/mpeg');
  assert.equal(typeOf('/media/a/picture.webp'), undefined);
  for (const url of ['/media/a/clip.mp4', '/media/a/clip.WEBM', '/media/a/song.m4a', '/presentations/deck/voice.mp3', '/media/a/stream.m3u8',
    '/media/teardown-lab-two/clip.mp4', '/labs/teardown-two/clip.mp4', '/coursesx/clip.mp4']) assert.equal(belongsInR2(url), true, url);
  for (const url of ['/media/a/picture.webp', '/media/a/page.html', '/courses/the-hidden-curriculum/lesson.mp4', '/media/teardown-lab/clip.mp4',
    '/labs/teardown/lander/clip.webm']) assert.equal(belongsInR2(url), false, url);
  const fleet = Object.values(LIVE_NOTEBOOKS).flatMap((n) => n.paths).filter((p) => p.startsWith('public/')).map((p) => p.slice('public/'.length));
  assert.deepEqual(STAYS_IN_GIT, ['courses/', ...fleet]);
});
