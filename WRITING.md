# Writing a post for aaronorelup.com

This is the one doc for writing or editing a post. Read it, and `PREVIEWS.md` (the hover card's
technical spec), before you touch a post. Don't copy the style of an existing post. Many of them
were written before these rules and are being rewritten to match them.

## Who reads it

A guy in his 20s or 30s who found the link on X. He's into AI, tech, art and making things. He
isn't a programmer and he's never been here before. He doesn't know Jefrie, Episode 5,
MiniMax-H3, a LoRA, D1 or what a worktree is. Aaron's boss, coworkers and friends read it too.

The blog isn't selling anything and isn't farming attention. Its one job is to give the reader
the most useful stuff in the least time, and let him stop the moment he has what he needs.

## Four layers. The reader can stop after any of them.

**1. Title: what the post is about.** A plain label, not a hook. A newcomer reads it and knows
the subject in five seconds.

- Name things the way a newcomer would: "my AI-made TV series", "an AI video model", "a rented
  cloud GPU". Not the insider name alone ("Episode 5", "MiniMax-H3", "an L40S").
- No teaser, no twist, no withheld answer, no "...and the one that didn't", no setup and then a
  reversal, no pun that hides the subject. One sentence at most.
- Aim for 60 characters. 70 is the limit.
- Don't start every title with "I" or "How". Vary it.

**2. Description (the `summary` field): what you'd learn.** One or two short sentences. What I
did or tested, and what the post tells you. If it's an experiment, say what it tests. It can give
the result. It never teases one: no "here's what happened", no "the answer surprised me", no
"and what I'd do differently". Aim for 200 characters. 240 is the limit.

**3. Callout (the hover card, `preview:`): the conclusions.** All of them, in plain words.
Someone who reads only the card leaves knowing what the post found.

- `verdict`: the result as a 2 to 5 word stamp. "4-5x faster, not 30x". 28 characters at most.
- `takeaway`: the main conclusion in one or two short sentences. A claim, with the number if
  there is one. Aim under 160 characters, 200 at most.
- `points`: up to 3 more findings the takeaway doesn't say. Most important first. Each stands
  on its own. 120 characters each at most.
- Only what the post says. Failures stay failures. The card is never more sure than the post.
- A picture from the post (`image`, 640×360 WebP, aim 30 KB) and, if the subject moves, a
  3-second silent `loop` (640×360 H.264, aim 150 KB, 4 seconds at most).
- The build's hard caps, in `src/data/limits.js`, are the outer limit: verdict 36,
  takeaway 200, point 150 characters, 3 points, still 48 KB, loop 240 KB. The targets here are
  the rule, and `npm run check` holds you to them.

**4. The post: conclusions first, then the rundown, then the details.**

- The first 2 to 4 sentences say what I did, why, and what I found. Anyone who stops there is
  informed. Give the newcomer the one line of context he needs right here (what the thing is).
- Then the quick rundown: each test or step and what came out of it, boom, boom, boom. Usually a
  short list where the bold lead of each item carries the point by itself.
- Then the details, under plain headings, for whoever wants them. A reader should find any
  detail by its heading. Each section starts with its point.
- Long logs, full tables, step-by-step tuning and making-of material get folded (see below) or
  go on a notes page. They don't sit in the main read.
- No closing moral, no wrap-up, no "what's next" unless something real is next. When the
  information runs out, the post ends.

## Voice

Aaron talking to a friend on the phone, telling him what he did, what he learned and what he
should take from it. Casual and direct. Written down and tidied, so the filler words go and the
tone stays.

- First person. "I asked Claude to...", "my agents did...". Aaron is the narrator even when
  agents did the work. Credit them plainly.
- Short sentences. Contractions. Plain words. "Honestly", "pretty", "so" and "I think" are fine.
- **No em dashes.** Few commas. No semicolons. No stacked parentheses. Not a lot of colons.
- Explain every term a newcomer won't know, in a few words, the first time. Or cut it.
- Keep the numbers that matter. Drop the ones that don't change the takeaway (decimal seconds,
  UTC timestamps, token counts nobody asked for).
- Humor as a trailing aside, not a punchline. Self-deprecation said plainly.
- Straight quotes and plain hyphens.

Never:

- The two-sentence contrast flip ("I did X. It was actually Y.").
- Cheekiness, lines that show off how clever they are.
- Telling the reader how to read it ("you can skim this", "the bold has everything").
- Hype words and stock phrases: incredible, powerful, game-changing, seamless, unlock, leverage,
  delve, "let's dive in", "buckle up", "here's the thing", "it turns out", "in this post",
  "spoiler:", "the short answer", "TL;DR".
- Emoji or exclamation marks.
- Chronicler disclaimers ("Written by Claude, the second chronicler... Times are UTC"). If an
  agent researched the post, one plain credit line in italics at the very end is enough.

Some of Aaron's own sentences, for the tone:

> I automated the input of my notes into Notion. It took me about 3 hours. I know I could just
> do it manually and it would have only taken me about 3 minutes each time, but at least now
> I'll never have an excuse not to take a note when I have a new idea.

> My agent spent 40 hours to save me 15 minutes and I didn't even need to tell it thank you.

> I need to stop prompting when I'm tired.

Whose voice: every post is Aaron's voice, except a few where Claude tells its own story (Echo,
and the film making-ofs: Crimson Coil, Earthlight, Bad. Very Bad., Context Window, Touch Move,
THE SMALL ONE). Those stay in Claude's first person, shorter, with every other rule here.
Those posts carry `voice: "claude"` in their frontmatter, and so does any notes page Claude wrote
as "I", whoever's the post (Aaron's pages leave it out), so Ask Goobie tells their "I" as Claude.

## Length

As short as the content allows. Length comes from having a lot to tell, never from telling it
slowly. The word counts are the main read only (not folded details, tables, captions or code).

- **Update** (something small happened, here's the link or the video): one or two paragraphs,
  under 200 words.
- **Post** (one experiment or one build): 300 to 700 words.
- **Deep dive** (many tests with real results): up to about 1,200 words, with the extra detail
  folded or on a notes page.

## Folding details

Use a plain `<details>` block. Leave a blank line after the `<summary>` line and before
`</details>`, or the markdown inside won't render. Don't style it inline, the post page does that.

```html
<details><summary>The tuning, step by step</summary>

- The model files loaded into memory in parallel at start-up, at 232 to 260 MB a second.
- `--highvram` (keep everything on the card) ran out of memory even on 48 GB, so it stays off.

</details>
```

The summary line says what's inside in plain words, like a heading.

## Splitting a making-of

When a post is the full story of how something was made (every wave of agents, every log, every
cost table) and that's far more than the deep dive tier, split it:

- The short post stays at its URL (`src/content/posts/<slug>.md`). It says what the thing is,
  where to watch or play it, what was interesting about making it, and the conclusions.
- The full making-of moves, intact, to `src/content/notes/<slug>.md`. It shows at
  `/ledger/<slug>/notes/`. Its frontmatter is three lines, four with `voice` (the end of "Frontmatter" below).
- The short post links to it in plain words: "The whole making-of is on
  [its notes page](/ledger/<slug>/notes/)."
- The never-publish rules apply to the notes page too.

## Media

Every post has media, and different kinds: pictures, video, audio, a demo. Aaron loves the
post "technology": side-by-side synced videos, before and after sliders, calculators, players,
playable games. They stay and they lead. Put each one where it answers a question. One great
comparison beats twenty pictures.

- The components (`<ao-compare>`, `<ao-slider>`, `<ao-calc>`, `<ao-bars>` and the rest) are
  listed with their markup at the top of `src/scripts/post-components.js` (and in
  `docs/COMPONENTS.md` once it exists). Use one before building something new.
- Pictures go under `public/media/<slug>/` as WebP, sized for the page, not multi-MB PNGs.
- Video and audio live in R2, not in git, at their normal URLs. Put the file in
  `public/media/<slug>/`, run `npm run media:push`, and commit the post with
  `src/data/media-manifest.json`. `docs/MEDIA.md` has the details.
- The full-size originals of anything you generate for a post (renders, clips, songs) go in
  Aaron's studio library with `studio push blog-posts <folder> --agent <you>`. The repo keeps
  only the web copy.
- The hover card gets a picture from the post too, a 3-second loop if the subject moves.
  `PREVIEWS.md` says how to make it.
- Nothing violent or gory in a card.

## Links

Link Aaron's other posts and projects wherever they give context. A newcomer who meets "my TV
series" should be one click from it. Use site paths (`/ledger/<slug>/`,
`/courses/i-love-my-evening-television/`, `/courses/the-hidden-curriculum/`, `/projects/`).

## Never publish

The repo is public and so is every post. Never put any of these in a post, a notes page, a card,
a caption, alt text or a filename:

- Aaron's day job or his employer's name.
- His plans to move or work abroad, or programs he's applying to.
- Money: his pay, savings, debts, what he can afford. (Costs of a test, like "$2.44 on a rented
  GPU", are fine.)
- Credentials, keys, tokens, or private links (private repos, private dashboards, his command
  centre).
- His private AI chat logs and roleplay chats.
- A character's private backstory. Only what's already public about a character.

And never link an unlisted post (`unlisted: true`) or the hidden easter-egg pages inside the
film posts. The exact names to watch for are in the blog-post skill in Aaron's agent kit, and
`npm run check` catches them (it holds only their hashes, so the public repo never names them).

## Frontmatter

Start every post with `npm run new-post "Title of the post"`. It makes
`src/content/posts/<slug>.md` with the next free `AO-###` and today's date. Never pick an
`AO-###` by hand.

```yaml
---
id: "AO-0XX"                      # from new-post, never by hand
title: "How much a rented cloud GPU speeds up my AI videos"
summary: "I rented a big graphics card online to render my AI video clips. How much faster it really was than my 8 GB laptop, what made the difference, and what an hour of video costs."
date: 2026-11-02
topic: "video"                    # required
project: ["evening-television"]   # optional
draft: true                       # until Aaron says it's good
preview:
  verdict: "4-5x faster, not 30x"
  takeaway: "A rented 48 GB card made my AI video clips 4 to 5 times faster than my laptop, once it had two speed settings my laptop already used."
  points:
    - "The first night it was only 1.2 to 1.9 times faster. It was running my laptop's 8 GB workarounds without its speed-ups."
  image: "/media/previews/renting-a-gpu.webp"
  alt: "What the picture shows"
---
```

- `topic` (required), one of: `video` (AI video and film), `art` (AI art and images), `3d` (3D
  and animation), `games`, `agents` (working with AI agents), `learning` (learning to build with
  AI), `site` (this website).
- `project` (optional), any of: `evening-television`, `blackwater`, `hidden-curriculum`,
  `characters`, `oil-paint`, `llm-monster-hunter`, `origin`. Only when the post really is part of
  that project.
- No `status`, `tags` or `series`: older posts still carry them until they're rewritten.
- The icon needs no field. It is `public/media/icons/<id>.webp` (256 px, at most 24 KB) and
  `<id>-96.webp` (at most 6 KB), named by the post's id. `icon:` overrides the path only when a
  post must share another's.
- A notes page (`src/content/notes/<slug>.md`) has only this, with `post` the same slug as its
  file, plus `voice: "claude"` when Claude wrote it as "I" ("Whose voice" above):

```yaml
---
post: "renting-a-gpu"
title: "Renting a cloud GPU: the full test notes"
summary: "Every run, setting and cost from the test, in order."
---
```

- Don't make up new topics or projects. They live in `src/data/taxonomy.js`.
- `draft: true` means the page isn't built at all. `unlisted: true` is different: the page builds
  at its URL but shows up in no list. Never use one to mean the other.

## Before it goes out

Every post waits for Aaron's OK. Keep `draft: true` and show him the draft. It goes live only
when he says so in his own words ("looks good", "publish it"). If his request already said to
publish it straight away, that counts. No agent and no scheduled job gives the OK. The daily blog
job is paused, and when it restarts its drafts wait for him the same way.

Check before you show him:

- [ ] Title, description and card pass the limits above.
- [ ] The first 2 to 4 sentences give the conclusions. The card gives all of them.
- [ ] Every term a newcomer won't know is explained or gone.
- [ ] No em dashes, no semicolons, no banned phrases, no closing moral.
- [ ] The main read is inside its tier. Logs and long tables are folded or on a notes page.
- [ ] Every number and claim is in the source (the run, the transcript, the files). Failures kept.
- [ ] The post has media, and the card has a picture from the post.
- [ ] Links to his other posts and projects work, and none goes to a never-link page.
- [ ] Nothing from the never-publish list, anywhere (text, alt, captions, filenames).
- [ ] `topic` is set. `project` only if it fits.
- [ ] `npm run check -- <your files>` shows no errors, and `npm run build` passes.
- [ ] You looked at the page (desktop and phone, day and night) and the hover card.
- [ ] Generated originals are in the studio library.

When he says go: set `draft: false` (or remove the line), build, push to `main`, and check
`https://aaronorelup.com/version.json` shows your commit. Then open the live post and its card.

## Worked examples

These three are Aaron-approved rewrites. They show the layers, not a style to copy word for word.

**AO-055.** Was: "I rented a 48 GB cloud GPU for my video model expecting 10 to 30 times my
laptop. It does 4 to 5"

- Title: How much a rented cloud GPU speeds up my AI videos
- Description: I rented a big graphics card online to render my AI video clips. How much faster
  it really was than my 8 GB laptop, what made the difference, and what an hour of video costs.
- Card: verdict "4-5x faster, not 30x". Takeaway "A rented 48 GB card made my AI video clips 4
  to 5 times faster than my laptop, once it had two speed settings my laptop already used."
- Opening: "I rented a graphics card online to see how much faster it would make my AI videos.
  **It's 4 to 5 times faster than my laptop.** I was expecting 10 to 30 times."
- Rundown item: "**Copy your local speed settings to the cloud first.** That was the whole
  difference."

**AO-062.** Was: "My projects folder holds 1.03 million lines of code. The first count said 3.1
million"

- Title: Counting every line of code in my AI projects
- Description: I had Claude count the code in the 29 projects in my current projects folder. How
  much there is, which projects are biggest, and why the first count was three times too high.
- Card: verdict "About a million lines". Takeaway "My 29 projects hold about 1.03 million lines
  of code. The first count said 3.1 million because two thirds of it was copies, auto-generated
  files and other people's code."
- Opening: "I asked Claude to count all the code in my projects folder. It came to about **1.03
  million lines across 29 projects**, not counting blank lines, comments or tests."

**AO-066.** Was: "One of six AI writers was asked to lie. The other five all caught it."

- Title: Testing whether AI writers catch a planted lie
- Description: Six Claude agents pitched an episode of my AI TV series, and one was secretly
  asked to slip in a convincing fake fact. Whether the other five noticed, and how fast.
- Card: verdict "All five caught it". Takeaway "All five other AI writers flagged the fake fact
  within 17 minutes, and none of them reused it. It drew more flags than any honest mistake in
  the room."
- Opening: it says what the series is and links it, what the experiment was, then "**All five
  other writers caught it.**" in the second paragraph, with the numbers.
- It ends on the last useful thing (the six pitches) and a one-line credit, not a moral.
