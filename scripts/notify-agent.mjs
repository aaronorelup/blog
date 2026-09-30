#!/usr/bin/env node
// Finds post files added in the current push and emails each one to the OpenClaw agent,
// which decides on its own whether to post it anywhere, where, in what words, and whether
// Aaron should review it first. This script's only job is the hand-off — it does not
// publish anything to dev.to, Bluesky, X or anywhere else.
//
// Required env vars: SMTP_HOST, SMTP_USER, SMTP_PASS.
// Optional: SMTP_PORT (default 465), SMTP_SECURE (default true), NOTIFY_TO, NOTIFY_FROM.
//
// Run with --dry-run to print exactly what would be sent without connecting to SMTP.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';
import nodemailer from 'nodemailer';

const SITE = 'https://aaronorelup.com';
const POSTS_DIR = 'src/content/posts';
const STATE_FILE = '.syndicated.json';
const TO = process.env.NOTIFY_TO || 'goobie.orelup@gmail.com';
const DRY_RUN = process.argv.includes('--dry-run');

// --verify logs in to SMTP and reports, without sending anything or touching state.
// The credential is the one thing this script cannot check for itself at rest: a Google
// App Password is silently revoked whenever the account password changes, which is
// exactly how three weeks of hand-offs were lost.
const VERIFY = process.argv.includes('--verify');

// A manual `workflow_dispatch` run is a deliberate catch-up: send anything the state file
// says has never gone out. That is the recovery path when a push-triggered run failed —
// re-running the old job instead would check out an old commit and push from a detached
// HEAD. `--only <slug>` narrows it to one post, so seven backed-up posts don't all land
// on the agent at once.
const MANUAL = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';

// Set when the push diff could not run and we fell back to "everything unsynced". That
// path is a catch-up rather than a reaction to one post, so an automatic run caps how
// many it will mail: a stale state file must never dump the whole back catalogue on the
// agent in one burst. Anything held back is listed and goes out on the next run, or
// immediately via a manual dispatch.
let usedFallback = false;
const MAX_AUTO_FALLBACK = 2;
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg !== -1 ? (process.argv[onlyArg + 1] || '').replace(/\.md$/, '') : null;

// git always reports forward slashes; path.join on Windows does not. The state file is
// keyed by path, so everything gets normalised or an already-handled post looks new —
// which here means a stray email to an agent that can post publicly.
const norm = (p) => p.split(path.sep).join('/');

const allPostFiles = () =>
  fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => norm(path.join(POSTS_DIR, f)));

function getChangedPostFiles() {
  // A manual run, or an explicit --only, is a deliberate request rather than a reaction
  // to a push — so the push diff is the wrong question. It would only ever surface the
  // newest commit's post and leave a backlog stranded, and `--only <slug>` run from a
  // laptop would find nothing at all. Consider every post and let .syndicated.json
  // decide what has actually gone out.
  if (MANUAL || ONLY) return allPostFiles();

  try {
    const before = process.env.GITHUB_EVENT_BEFORE;
    const range = before && !/^0+$/.test(before) ? `${before}..HEAD` : 'HEAD~1..HEAD';
    const out = execSync(`git diff --name-only --diff-filter=A ${range} -- ${POSTS_DIR}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // The diff ran. An empty result is a real answer: this push added no posts.
    return out.split('\n').map((f) => f.trim()).filter(Boolean);
  } catch (e) {
    // The diff could NOT run — nearly always because the "before" commit is missing from
    // a shallow clone, which happens on any push of more than one commit. Returning []
    // here reported success and silently dropped seven posts. Fall back to the full list
    // and let .syndicated.json decide; it already knows what has gone out, so the worst
    // case is a catch-up, not a duplicate.
    console.warn(
      `Could not diff for added posts (${String(e.message).split('\n')[0]}).\n` +
        'Falling back to everything not yet recorded in ' + STATE_FILE + '.',
    );
    usedFallback = true;
    return allPostFiles();
  }
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { synced: [] };
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  state.synced = (state.synced || []).map(norm);
  return state;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// Everything the agent needs to make its own call, in one plain-text body: the framing
// up top, the metadata, then the post itself verbatim.
function buildEmail(post) {
  const { data, body, url, slug } = post;
  const subject = `New ledger post: ${data.id} — ${data.title}`;
  const text = [
    'A new post just went live on aaronorelup.com.',
    '',
    'You decide whether this is worth posting anywhere, which platforms suit it, how to',
    'word it for each, and whether to check with Aaron before posting. Nothing has been',
    'published to any social account — this email is the only notification that went out.',
    '',
    '--- metadata ---',
    `id:      ${data.id}`,
    `title:   ${data.title}`,
    `summary: ${data.summary}`,
    `date:    ${data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date}`,
    `status:  ${data.status || 'note'}`,
    `tags:    ${(data.tags || []).join(', ') || '(none)'}`,
    `slug:    ${slug}`,
    `url:     ${url}`,
    '',
    '--- full post (markdown) ---',
    '',
    body.trim(),
  ].join('\n');
  return { subject, text };
}

async function main() {
  if (VERIFY) {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('Set SMTP_HOST, SMTP_USER and SMTP_PASS to verify.');
      process.exit(1);
    }
    const t = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    try {
      await t.verify();
      console.log(`SMTP OK - ${SMTP_USER} can send via ${SMTP_HOST}. Nothing was emailed.`);
      process.exit(0);
    } catch (e) {
      console.error(`SMTP FAILED - ${e.message}`);
      process.exit(1);
    }
  }

  const files = getChangedPostFiles();
  const state = loadState();
  const alreadySent = new Set(state.synced);

  let newFiles = files.filter((f) => !alreadySent.has(f));
  if (ONLY) newFiles = newFiles.filter((f) => path.basename(f, '.md') === ONLY);

  // Cap an automatic catch-up (see usedFallback). A deliberate manual run is exempt:
  // that is Aaron asking for the backlog on purpose.
  if (usedFallback && !MANUAL && !ONLY && newFiles.length > MAX_AUTO_FALLBACK) {
    const held = newFiles.slice(MAX_AUTO_FALLBACK);
    newFiles = newFiles.slice(0, MAX_AUTO_FALLBACK);
    console.warn(
      `Fallback run: sending only ${MAX_AUTO_FALLBACK} of ${newFiles.length + held.length} ` +
        'outstanding post(s) so the agent is not flooded. Held back:',
    );
    held.forEach((f) => console.warn(`  ${f}`));
  }
  if (newFiles.length === 0) {
    console.log(ONLY ? `Nothing outstanding matching "${ONLY}".` : 'No new posts to hand off.');
    return;
  }
  console.log(`${newFiles.length} post(s) to hand off to ${TO}:`);
  newFiles.forEach((f) => console.log(`  ${f}`));

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  let transport = null;
  if (!DRY_RUN) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error(
        'SMTP_HOST, SMTP_USER and SMTP_PASS must all be set. Nothing sent.\n' +
          'Add them as repo secrets: Settings → Secrets and variables → Actions.\n' +
          'For Gmail: SMTP_HOST=smtp.gmail.com, SMTP_USER=<the sending address>,\n' +
          'SMTP_PASS=<a Google App Password, not the account password>.',
      );
      process.exit(1);
    }
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  let failures = 0;
  for (const file of newFiles) {
    if (!fs.existsSync(file)) continue; // e.g. deleted before this ran
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const slug = path.basename(file, '.md');
    const post = { data: parsed.data, body: parsed.content, slug, url: `${SITE}/ledger/${slug}/` };

    if (post.data.draft || post.data.unlisted) {
      console.log(`Skipping ${post.data.draft ? 'draft' : 'unlisted post'}: ${file}`);
      continue;
    }

    const { subject, text } = buildEmail(post);
    if (DRY_RUN) {
      console.log(`\n=== would send to ${TO} ===`);
      console.log(`Subject: ${subject}`);
      console.log(text.slice(0, 700) + (text.length > 700 ? '\n… [truncated in dry run]' : ''));
      state.synced.push(file);
      continue;
    }

    console.log(`Handing off ${file} (${post.data.id}: ${post.data.title})`);
    try {
      await transport.sendMail({
        from: process.env.NOTIFY_FROM || SMTP_USER,
        to: TO,
        subject,
        text,
      });
      console.log(`  [email] sent to ${TO}`);
      state.synced.push(file);
    } catch (e) {
      // Leave it out of the state file so the next run tries again.
      console.error('  [email] FAILED:', e.message);
      failures += 1;
    }
  }

  if (!DRY_RUN) saveState(state);

  // A send that failed must not leave a green check. The whole hand-off went unnoticed
  // for three weeks because a rejected SMTP login was logged and then exited 0, so the
  // workflow reported success while the agent got nothing. Fail loudly instead; the
  // posts stay out of the state file, so the next run retries them.
  if (failures > 0) {
    console.error(
      `\n${failures} post(s) could NOT be emailed to ${TO}. They are not recorded as ` +
        'sent, so the next push or a manual "Run workflow" will retry them.',
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
