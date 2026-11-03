---
id: "AO-043"
title: "How an AI agent's post briefly rolled my site back two months"
summary: "A Claude session in the cloud started from a two-month-old copy of my blog, and Cloudflare published it over the live site. How it got through, how it was undone, and what stops it now."
date: 2026-10-09
topic: "site"
project: []
preview:
  verdict: "Rolled back in 8 minutes"
  takeaway: "The cloud agent did what its stale copy of the code told it to, and three settings nobody had checked since August put its branch on the live site."
  points:
    - "GitHub still listed the August branch as the default, so the agent saw three posts and numbered its own AO-004."
    - "Cloudflare built every branch with the command that publishes the live site, so the push went live in about 40 seconds."
    - "Four stops now: main is the default, the old branch is deleted, branch builds are off, and only main will build."
  image: "/media/previews/the-branch-that-went-live.webp"
  alt: "The site as the branch served it: a plain dark list of four posts, with AO-004 Scythe and serpent at the top"
---

Just after midnight on 8 October, an AI agent working in the cloud pushed a blog post to a side
branch of my site's code. It was Claude Haiku, the smallest Claude model. About 40 seconds later
Cloudflare, which hosts the site, made that branch the live site. **For eight minutes
aaronorelup.com was the site as it stood on 2 August**, with four posts and none of the
thirty-nine I'd written since.

The agent did what its copy of the code told it to. Three settings nobody had looked at since
August did the rest, and four separate stops now keep it from happening again.

Quick context. A branch is a separate copy of the code you can change without touching the real
one, and the default branch is the one GitHub hands to anyone starting fresh.

<ao-slider aspect="16/9" labels="Live 00:39–00:47, 8 Oct|Live before and after">
<img src="/media/the-branch-that-went-live/august-build.webp" alt="The homepage the branch served: AARON ORELUP in monospace over a list of four posts, AO-004 Scythe and serpent dated Oct 08 2026 above AO-002, AO-003 and AO-001 from August">
<img src="/media/the-branch-that-went-live/main-build.webp" alt="The homepage built from main: the night tea house scene with cherry trees, a lantern and the Aaron Orelup welcome card">
<figcaption><b>The same address, two builds</b><span class="ao-meta">Left: the cloud branch, rebuilt from its own files on 9 Oct to show what it served. Right: the live site the same day, at the same size.</span></figcaption>
</ao-slider>

How it went:

- **GitHub still handed out the August copy.** The default branch was an old one called
  `master`, with three posts, so the agent numbered its post AO-004.
- **My blog's rules never left my laptop.** The cloud session never saw them.
- **Cloudflare put every branch live.** Branch builds ran the same command that replaces the
  live site.
- **A Claude session on my laptop had the site back 8 minutes after it broke**, then fixed what
  it could reach and asked me before the rest.
- **The site can now say which build it's running.**

## How it got through

**The default branch.** After 2 August I kept working on my real branch, `main`, and never went
back to `master`. My laptop's copy was on `main`, so I never noticed `master` was still the
default.

**What a cloud session gets.** A Claude Code session on claude.ai starts with a fresh copy of the
default branch and nothing else. My blog's rules sat in a `CLAUDE.md`, the file Claude reads for
instructions, one folder above the code on my laptop. They say to start from `main`. I'd never
committed the file, so it was never saved into the code itself.

**What Cloudflare did with a branch.** Cloudflare builds the site from the code on every push.
"Builds for non-production branches" was on, and those builds ran `npx wrangler deploy`, the
command that replaces the live site. So any branch went straight to the live site.

## How it was undone

At 00:42 I asked a session on my laptop running Opus, the biggest Claude model, to fix it:

> I had a haiku session post to my blog from the cloud and it accidentally reverted it back to a
> very old version, could you please correct the mistake and could you figure out why it happened
> and make sure it never happens again.

It put the last good version back at 00:47:58, 8 minutes 10 seconds after it broke. Then it
checked it live, down to a video skipping ahead. [That fix](/ledger/every-video-can-seek/) was
only a day old. After that it made `main` the default, committed a `CLAUDE.md` into the code
and added a guard that fails the build on any branch but `main`.

## The part that needed me

The guard only lives in the new code, and the session said so plainly. The two old branches
didn't have it, so they could still go live. Fixing that needed my Cloudflare login.

<ao-timeline lanes="h:Haiku 5.5 · cloud|c:Cloudflare|o:Opus 5.5 · laptop|a:Me">
<ol>
<li data-lane="c"><time>7 Oct 22:50</time><p>Builds the site from <code>main</code> and puts it live. The last good version.</p></li>
<li data-lane="h"><time>8 Oct 00:39:08</time><p>Saves its post as AO-004 on top of the August copy, <code>master</code>, and pushes it to a side branch.</p></li>
<li data-lane="c"><time>00:39:48</time><p>Builds the branch and puts it live with <code>wrangler deploy</code>. The site now has four posts.</p></li>
<li data-lane="a"><time>00:42</time><p>I ask the laptop session to fix it and find out why.</p></li>
<li data-lane="o"><time>00:47:58</time><p>Puts the last good version back. Checks five pages and a video live.</p></li>
<li data-lane="o"><time>00:54:59</time><p>Pushes the build guard and the repo's own <code>CLAUDE.md</code>, then makes <code>main</code> the default branch.</p></li>
<li data-lane="o"><time>00:58</time><p>Reports, and asks me before two things: changing Cloudflare's setting in my Chrome, and deleting the two old branches.</p></li>
<li data-lane="a"><time>16:08</time><p><q>yes do the cloudflare setting in chrome and delete the branches</q></p></li>
<li data-lane="o"><time>16:09</time><p>Deletes <code>master</code> and the Haiku branch and notes the commits they can be restored from. Chrome isn't signed in to Cloudflare, so it stops and leaves typing my password to me.</p></li>
<li data-lane="a"><time>16:28</time><p><q>ok I'm signed in</q></p></li>
<li data-lane="o"><time>16:30</time><p>Turns off builds for other branches, changes their command to <code>npx wrangler versions upload</code> (uploads a version, never puts it live), and reloads to check it held.</p></li>
</ol>
</ao-timeline>

Now a stale branch has to get past four stops. `main` is the default, `master` is gone,
Cloudflare only builds `main`, and the build refuses anything else.

The Haiku session's own post was never published. Its painting is one of several of the same
picture, in [the post where nine Claudes paint it](/ledger/nine-claudes-one-painting/).

## Asking the live site which build it is

What bothered me was how I found out. The pages looked old, and I only saw it because I happened
to look, three minutes after it broke. Nothing said which commit (one saved change to the code)
the live site was built from.

Now every build writes `/version.json` with its commit, branch, time and newest post, and every
session is told to check it after a push. This button asks the live site from your browser:

<ao-fetch>
<ol>
<li data-url="/version.json" data-show="body">Which build is this page from?</li>
</ol>
<figcaption><b>The site's own answer</b><span class="ao-meta">A right answer says branch "main" and a recent commit. Between 00:39 and 00:47 on 8 Oct it would have named the Haiku branch, if the file had existed then.</span></figcaption>
</ao-fetch>

<details><summary>The commit, the deploy history and the build guard</summary>

The commit the cloud session pushed. Its clock is UTC, five hours ahead of mine, so 05:39 there is
00:39 my time.

```
2ac796e  Thu Oct 8 05:39:08 2026 +0000  Claude
    AO-004: scythe and serpent, painted with claude-paint
    Co-Authored-By: Claude Haiku 5.5

 public/paintings/scythe.png             | Bin 0 -> 3319429 bytes
 src/content/posts/scythe-and-serpent.md |  17 +++++++++++++++++
```

Two files on top of August. To that commit, the thirty-nine newer posts had never existed.

The laptop session's first look at the deploy history failed. It ran `wrangler deployments list`,
and Cloudflare's tool answered that the Worker didn't exist. The Worker is the site's program on
Cloudflare. The repo's config names it `aaronorelup-blog`, and on Cloudflare it's called `blog`.
Asking for `blog` gave the history, and the problem with it. Every deploy was made by the same account through the same tool, so nothing
marks one as a branch. The commit-to-version pairs come from Cloudflare's check run on each
commit, the build report it posts back to GitHub.

| Deployed (Central) | Version | Built from |
|---|---|---|
| 7 Oct 22:50 | `34b650ef` | `5170ce2` on `main`: [AO-038](/ledger/claude-paints-in-oil/)'s paintings |
| 8 Oct 00:39 | `0075e1af` | `2ac796e` on `claude/pensive-hamilton-yuqj1a` |
| 8 Oct 00:47 | `34b650ef` again | rollback |

The rollback itself was `npx wrangler rollback 34b650ef… --name blog`. The first turn took 16
minutes in all.

The guard went into the build, and the session tested it both ways before it pushed it. A fake
branch build failed and a fake `main` build passed.

```js
const ciBranch = process.env.WORKERS_CI ? process.env.WORKERS_CI_BRANCH : null;
if (ciBranch && ciBranch !== 'main') {
  throw new Error(
    `Not building "${ciBranch}" on Cloudflare: only main deploys aaronorelup.com. ` +
      'Rebase the branch onto main and merge it there (see CLAUDE.md).',
  );
}
```

</details>
