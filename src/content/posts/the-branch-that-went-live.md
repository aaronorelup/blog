---
id: "AO-043"
title: "A cloud session pushed one post from a branch, and my whole site went back to August"
summary: "A Claude Haiku 5.5 session in the cloud started from the repo's stale default branch, pushed its post on a side branch, and Cloudflare deployed that branch over the live site. For eight minutes aaronorelup.com had four posts. How it got through, how it was undone, and the four things that now stop it."
date: 2026-10-09
status: "shipped"
tags: ["claude-code", "agents", "cloudflare", "git", "blog"]
series: ["agent-runs"]
preview:
  verdict: "Rolled back in 8 minutes"
  takeaway: "The cloud session did what its copy of the repo told it to. Three settings nobody had looked at since August turned one post into a two-month rollback."
  points:
    - "GitHub's default branch was still master, frozen on 2 August with three posts, so the session numbered its post AO-004."
    - "Cloudflare built every branch with the command that deploys to production. The push was live about 40 seconds later."
    - "Four fixes now: default branch main, master deleted, branch builds off, and a build that refuses any branch but main."
  image: "/media/previews/the-branch-that-went-live.webp"
  alt: "The site as the branch served it: a plain dark list of four posts, with AO-004 Scythe and serpent at the top"
---

At 00:39 on 8 October, my time, a Claude Haiku 5.5 session running in the cloud pushed a branch
to this blog's repository, and about forty seconds later Cloudflare made that branch the live
site. For eight minutes, aaronorelup.com was the site as it stood on 2 August: four posts, a
plain dark list, no tea house, and none of the thirty-nine posts written since.

**The session did nothing wrong by what it could see.** It started from the branch GitHub called
the default, found three posts there, numbered its own AO-004, and pushed it to a side branch
rather than to `main`. Three settings that nobody had looked at since August did the rest.

<ao-slider aspect="16/9" labels="Live 00:39–00:47, 8 Oct|Live before and after">
<img src="/media/the-branch-that-went-live/august-build.webp" alt="The homepage the branch served: AARON ORELUP in monospace over a list of four posts, AO-004 Scythe and serpent dated Oct 08 2026 above AO-002, AO-003 and AO-001 from August">
<img src="/media/the-branch-that-went-live/main-build.webp" alt="The homepage built from main: the night tea house scene with cherry trees, a lantern and the Aaron Orelup welcome card">
<figcaption><b>The same address, two builds</b><span class="ao-meta">left: commit 2ac796e (the cloud branch) rebuilt on 9 Oct from its own files and rendered at 1280×720 in headless Edge, a re-render of what it served; right: the live site on 9 Oct, same size</span></figcaption>
</ao-slider>

Yesterday's post, about [videos that couldn't seek](/ledger/every-video-can-seek/), left this out,
because one of the fixes still needed me. It doesn't any more.

## Three settings in a row

**The default branch.** The repo began on `master`. On 2 August I merged `main` into it twice,
then kept working on `main` and never went back. GitHub still listed `master` as the default
branch on the night it happened, frozen at AO-003. My laptop sessions never noticed, because my
local checkout was on `main`.

**What a cloud session gets.** A Claude Code session on claude.ai starts with a fresh clone of the
repository, on the default branch, and nothing else. The rules for this blog lived in a
`CLAUDE.md` one folder above the repo on my laptop: start from `main`, the next post number, how
publishing works. It had never been committed, so the cloud session never saw a line of it. The
commit it pushed says so in its own way:

```
2ac796e  Thu Oct 8 05:39:08 2026 +0000  Claude
    AO-004: scythe and serpent, painted with claude-paint
    Co-Authored-By: Claude Haiku 5.5

 public/paintings/scythe.png             | Bin 0 -> 3319429 bytes
 src/content/posts/scythe-and-serpent.md |  17 +++++++++++++++++
```

Two files on top of August. To that commit, the thirty-nine newer posts had never existed.

**What Cloudflare did with a branch.** The site is built by Cloudflare's Workers Builds on every
push. "Builds for non-production branches" was switched on, and the command those builds ran was
`npx wrangler deploy`, which is the command that replaces the live site. So any branch pushed to
the repo went to production, not to a preview.

## Undoing it

At 00:42 I asked a session on my laptop (Opus 5.5):

> I had a haiku session post to my blog from the cloud and it accidentally reverted it back to a
> very old version, could you please correct the mistake and could you figure out why it happened
> and make sure it never happens again.

Its first look at the deploy history failed: `wrangler deployments list` answered that the Worker
does not exist. The repo's config names it `aaronorelup-blog`; on Cloudflare it is called `blog`.
Asking the API for `blog` gave the history, and the problem with it: every deploy was made by the
same account through the same tool. Nothing marks one as a branch.

| Deployed (Central) | Version | Built from |
|---|---|---|
| 7 Oct 22:50 | `34b650ef` | `5170ce2` on `main`: AO-038's paintings |
| 8 Oct 00:39 | `0075e1af` | `2ac796e` on `claude/pensive-hamilton-yuqj1a` |
| 8 Oct 00:47 | `34b650ef` again | rollback |

The commit-to-version pairs come from Cloudflare's check run on each commit. At 00:47:58 it ran
`npx wrangler rollback 34b650ef… --name blog`, and seconds later the tea house answered again,
AO-041 and the oil paintings returned 200, and a video answered a byte range with 206. The site
had been wrong for 8 minutes 10 seconds.

The rest of the first turn, 16 minutes in all, went on the causes it could reach from a terminal.
It switched GitHub's default branch to `main`, committed a short `CLAUDE.md` into the repo for
sessions that only ever see the repo, and added a guard to the build itself, tested both ways
before it was pushed (a fake branch build failed, a fake `main` build passed):

```js
const ciBranch = process.env.WORKERS_CI ? process.env.WORKERS_CI_BRANCH : null;
if (ciBranch && ciBranch !== 'main') {
  throw new Error(
    `Not building "${ciBranch}" on Cloudflare: only main deploys aaronorelup.com. ` +
      'Rebase the branch onto main and merge it there (see CLAUDE.md).',
  );
}
```

It also said plainly what the guard can't do: it lives in the new code, so `master` and the Haiku
branch, which don't contain it, would still deploy if anyone pushed to them. That part needed the
Cloudflare dashboard, which its login couldn't read.

## The part that needed me

<ao-timeline lanes="h:Haiku 5.5 · cloud|c:Cloudflare|o:Opus 5.5 · laptop|a:Me">
<ol>
<li data-lane="c"><time>7 Oct 22:50</time><p>Builds <code>5170ce2</code> from <code>main</code> and deploys it: the last good version.</p></li>
<li data-lane="h"><time>8 Oct 00:39:08</time><p>Commits AO-004 on top of <code>master</code> (2 August) and pushes <code>claude/pensive-hamilton-yuqj1a</code>.</p></li>
<li data-lane="c"><time>00:39:48</time><p>Builds the branch and deploys it to production with <code>wrangler deploy</code>. The site now has four posts.</p></li>
<li data-lane="a"><time>00:42</time><p>I ask the laptop session to fix it and find out why.</p></li>
<li data-lane="o"><time>00:47:58</time><p>Rolls production back to version <code>34b650ef</code>. Checks five pages and a byte range live.</p></li>
<li data-lane="o"><time>00:54:59</time><p>Pushes the build guard and the repo's own <code>CLAUDE.md</code> (<code>e537351</code>), then makes <code>main</code> the default branch.</p></li>
<li data-lane="o"><time>00:58</time><p>Reports, and asks before two things: changing Cloudflare's setting in my Chrome, and deleting the two old branches.</p></li>
<li data-lane="a"><time>16:08</time><p><q>yes do the cloudflare setting in chrome and delete the branches</q></p></li>
<li data-lane="o"><time>16:09</time><p>Deletes <code>master</code> and the Haiku branch, noting the commits they can be restored from. Chrome is signed out of Cloudflare; it stops, since typing my password is mine to do.</p></li>
<li data-lane="a"><time>16:28</time><p><q>ok I'm signed in</q></p></li>
<li data-lane="o"><time>16:30</time><p>Turns off builds for non-production branches, changes their command to <code>npx wrangler versions upload</code> (uploads a version, never deploys), reloads to confirm it held.</p></li>
</ol>
</ao-timeline>

The last change is belt and braces: if branch builds are ever switched back on, they now upload a
version that goes nowhere instead of replacing the site. So there are four separate stops, and a
stale branch has to get past all of them: the default branch is `main`, `master` is gone,
Cloudflare only builds `main`, and the build refuses to run on anything else.

The painting the Haiku session made is not published. It is one of several paintings of the same
picture, and that is a different post.

## Asking the site what it is

What bothered me afterwards was how the problem showed itself: the pages looked old. There was
nowhere to ask the live site which commit it was built from. So now there is. Every build writes
`/version.json` with the commit, the branch Cloudflare built, the time, and the newest listed
post. After a push, that commit should be the one just pushed. This button asks the live site
from your browser:

<ao-fetch>
<ol>
<li data-url="/version.json" data-show="body">Which build is this page from?</li>
</ol>
<figcaption><b>The site's own answer</b><span class="ao-meta">a right answer: branch "main" and a recent commit; on 8 Oct between 00:39 and 00:47 it would have said "claude/pensive-hamilton-yuqj1a", had the file existed</span></figcaption>
</ao-fetch>

The repo's instructions now tell every session to compare it with what it just pushed, so the
next time a deploy and a push disagree, something other than my eyes can notice. **Until this week the only
alarm on this site was me happening to look at it, at 00:42, three minutes after it broke.**
