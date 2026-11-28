---
id: "AO-101"
title: "Edit a page with Claude Code's tools instead of reprinting the file"
summary: "Four of my own web pages got five design edits each, three runs a side, against a chat that answers every edit with the full page."
date: 2026-11-28
topic: "agents"
draft: false
credits:
  owner: "Gages"
  worker: "Anthropic fleet"
  orchestrator: "Opus 5.5 xhigh"
  cost: 32.32
preview:
  verdict: "4-19x cheaper, not 2x"
  takeaway: "Claude Code's edits averaged $0.12 to $0.17 a run at API prices on every page. The chat that reprinted the page averaged $0.49 on a 14 KB page and $3.26 on a 92 KB game."
  points:
    - "Claude Code wrote 68,126 output tokens in 12 runs, the chat 1.31 million. It never read a page whole."
    - "The fifth chat edit cost 7% to 16% more than the first, not 3 times more. Every run here began from a finished page."
    - "A judge marked 60 of 60 chat edits landed and 59 of 60 Claude Code edits. No page threw a JavaScript error."
  image: "/media/previews/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file.webp"
  alt: "Line chart of cost per run at API prices, chat that reprints the whole file vs Claude Code: explainer 14 KB $0.49 vs $0.12, data card 20 KB $0.71 vs $0.15, art tool 48 KB $1.69 vs $0.13, game 92 KB $3.26 vs $0.17"
---

My agents tested a claim from Andrew Sidorov on X: a one-page site plus 5 design edits costs about half as much in Claude Code as in a chat that hands back the whole file after every edit. They ran it on four of my own pages, 5 edits each, 3 runs per side, all on Claude Sonnet 5.5. **Claude Code averaged $0.12 to $0.17 a run at API prices on every page. The whole-file chat averaged $0.49 on a 14 KB explainer and $3.26 on a 92 KB game, 4 to 19 times more.** Both landed nearly every edit: 60 of 60 in chat, 59 of 60 in Claude Code.

![Line chart of cost per run at API prices, chat that reprints the whole file vs Claude Code: explainer 14 KB $0.49 vs $0.12, data card 20 KB $0.71 vs $0.15, art tool 48 KB $1.69 vs $0.13, game 92 KB $3.26 vs $0.17](/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/cost-per-run.webp)

Claude Code is Anthropic's coding agent. It works on files on disk with tools that search a file, read part of it and swap a few lines. A chat with no tools answers in text, so one colour change means printing the whole page. Sidorov's [article on X](https://x.com/madrew_st/status/2126398013652291944) measured the two on a made-up coffee shop page of about 40 KB, 2 runs each: building it and making 5 edits cost $0.51 to $0.62 in Claude Code against $1.11 to $1.35 in chat.

The technique as a template: keep the page as a file in its own folder and ask Claude Code for each change in one session, instead of pasting the page into a chat that answers with the whole file (optional: run it headless and carry the session on with `--resume`).

- **The chat's cost grew with the page. Claude Code's stayed flat.** Mean per run: explainer $0.49 vs $0.12, data card (20 KB) $0.71 vs $0.15, art tool (48 KB) $1.69 vs $0.13, game $3.26 vs $0.17.
- **Claude Code wrote 19 times fewer tokens.** 68,126 output tokens over its 12 runs against 1.31 million in chat.
- **It never read a page whole.** In every run it searched for the spots and read 74 to 275 lines in all. On the two small pages it still took in more input than the chat, 1.6 and 2 times as much, because its own instructions and tool results add up. On the two big pages it took in less, 0.58 and 0.42 times as much.
- **Chat edits got only a little dearer.** The fifth chat edit cost 7% to 16% more than the first. In the claim the last edit cost 3 times the first step, but there step one built the page from nothing. Here every run started from a finished page, so the chat paid for the whole page from the first step.
- **Time:** about a minute per run in Claude Code, 3 to 18 minutes in chat.
- **Checks:** a separate Opus 5.5 judge that saw only the final page and the 5 requests marked the edits. The one miss: in one data card run, Claude Code animated the new stat tiles instead of the page's sections. All 24 final pages opened in a headless browser at desktop and phone width with no JavaScript error. Nobody judged how they look.

## The four pages

- **Game: [The Lockkeeper's Ledger](/gauntlet/lockkeeper/opus-5-5-low/)**, 92 KB, a canal-lock scheduling game from my [Sonnet vs Opus gauntlet](/ledger/sonnet-vs-opus-gauntlet/).
- **Art tool: [LOOM Studio](/gauntlet/loom/sonnet-5-5-low/)**, 48 KB, a tiny language for woven cloth.
- **Data page: CNDY-041**, 20 KB, a lab card of AI video keyframe measurements from my [daily candy machine](/ledger/candy-machine/).
- **Explainer: [The Previs Film Flow](/tools/previs-film-flow/)**, 14 KB, my AI film process in 20 steps.

Each page got 5 edits: a colour, a button, a new section, a phone layout fix and an animation tweak, different for each page.

<details><summary>The 20 edit requests</summary>

- **Game 1:** Change the water colour from blue (#3f84b8) to a deep canal green (#2e7d6b) everywhere it is used, including the legend swatch and the canvas drawing.
- **Game 2:** Add a Reset button next to the Play button that stops the animation and puts the canal clock back to the start of the day.
- **Game 3:** Add a small 'How to play' box just above the canal section with three numbered steps: press Play to watch the day, read why boats were late, then add a disruption and press Re-plan.
- **Game 4:** Mobile fix: on screens narrower than 600px, stack the two-column grids into one column and make the buttons in the controls row full width.
- **Game 5:** Animation tweak: make the boats glide smoothly between positions in the canal animation instead of jumping from one minute to the next.
- **Art tool 1:** Change the gold accent colour (#e8b04a) to a coral pink (#ff7a6b) everywhere it is used, including the highlighted current line.
- **Art tool 2:** Add a 'Download PNG' button next to the Loom / Fabric / Text output view buttons that saves the fabric canvas as a PNG file named loom-fabric.png.
- **Art tool 3:** Add a fourth tab called 'About' after Conformance, with two short paragraphs that explain what LOOM is and how to start: pick a pattern in the Gallery, then press Weave.
- **Art tool 4:** Mobile fix: on screens narrower than 600px, put the code editor above the canvases at full width, and make the playback buttons at least 44px tall so they are easy to tap.
- **Art tool 5:** Animation tweak: when switching between the Studio, Gallery, Conformance and About tabs, fade the new tab in over 0.25 seconds instead of switching instantly.
- **Data page 1:** Change the heading colour (currently the gold #F0C06A) to a soft teal (#6EC6B8) for the title and every section heading.
- **Data page 2:** Add an 'Expand all' button next to the Copy button that opens every collapsible details block on the page. Once they are open the button reads 'Collapse all' and closes them again.
- **Data page 3:** Add an 'At a glance' section right under the title with three small stat tiles side by side: '4 trials', '7 keyframes', '2 models'.
- **Data page 4:** Mobile fix: on screens narrower than 480px, make every image and table fit the screen width with no sideways scrolling, and reduce the page's side padding to 12px.
- **Data page 5:** Animation tweak: make the sections' fade-up entrance take 0.3 seconds instead of 0.6, and stagger it so each section starts 80ms after the one before.
- **Explainer 1:** In light mode, make the 'Me' cards and the 'Me' legend swatch light blue (background #DCEBFA, border #5A8FD0) instead of yellow. Leave dark mode as it is.
- **Explainer 2:** Add a 'Back to top' button fixed at the bottom right that only appears after scrolling down 600px and scrolls smoothly back to the top when clicked.
- **Explainer 3:** Add a short 'What you need' section right after the header, with a bulleted list: a GPU (local or cloud), Blender, ComfyUI, and about 2 hours.
- **Explainer 4:** Mobile fix: on screens narrower than 480px, make the main title 28px, and make the step cards use the full width with 12px padding.
- **Explainer 5:** Animation tweak: make each step card fade and slide up gently the first time it scrolls into view, and turn this off for people who prefer reduced motion.

</details>

## How it ran

Both arms got the same edits in the same order, on Sonnet 5.5 at medium effort, with no project instructions, hooks or extra tool servers. The chat arm was one conversation in Claude Code's headless mode with every tool turned off, the page pasted into the first message and a one-paragraph system prompt asking for the complete file after every edit. The Claude Code arm was one session in a folder holding only the page, with its file tools (Read, Edit, Write, Glob and Grep).

<details><summary>The prompts word for word, and how cost was counted</summary>

The chat arm's system prompt:

````
You are Claude, a helpful assistant in a chat. The user is working on a single-file web page with you. Every time the user asks for a change, reply with the complete updated file, from <!doctype html> to </html>, in one ```html code block, with nothing left out or abbreviated, as a chat artifact does. Keep everything else exactly as it was. You may write one short sentence before the code block.
````

The Claude Code arm kept its normal system prompt. Its first message was `The page in this folder is index.html. Edit 1: <edit>`, then `Edit <n>: <edit>` for the rest, each continued with `--resume`.

Costs come from Claude Code's own report for each call, at API list prices. The runs went on a subscription, so nothing was billed. The 3 runs of one page and arm ran at the same moment with the same prompts, so they could share the prompt cache: one LOOM chat run paid $0.24 for its first step where the other two paid $0.34.

</details>

<details><summary>Every page and arm, 3 runs each</summary>

Ranges are the 3 runs. Input counts everything a run's calls took in, cached or not.

| Page | Arm | Cost per run | Output tokens | Input | Of it cached | Minutes | Edits landed | Step 1 | Step 5 |
|---|---|---|---|---|---|---|---|---|---|
| Game | Chat | $3.26 to $3.27 | 229,878 to 230,560 | 687,616 to 688,113 | 458,957 to 459,315 | 17.8 to 17.9 | 5, 5, 5 | $0.640 to $0.641 | $0.680 to $0.686 |
| Game | Claude Code | $0.16 to $0.19 | 6,048 to 6,305 | 243,279 to 352,147 | 223,484 to 329,487 | 1.1 | 5, 5, 5 | $0.023 to $0.025 | $0.059 to $0.071 |
| Art tool | Chat | $1.64 to $1.72 | 119,530 to 121,833 | 362,553 to 367,555 | 241,965 to 269,019 | 9.3 to 9.5 | 5, 5, 5 | $0.243 to $0.335 | $0.348 to $0.353 |
| Art tool | Claude Code | $0.12 to $0.15 | 5,028 to 6,263 | 186,750 to 234,728 | 173,619 to 218,660 | 0.9 to 1.1 | 5, 5, 5 | $0.023 to $0.024 | $0.010 to $0.015 |
| Data page | Chat | $0.71 | 49,344 to 49,673 | 150,240 to 151,667 | 99,165 to 101,138 | 4.1 to 4.2 | 5, 5, 5 | $0.134 to $0.137 | $0.146 to $0.147 |
| Data page | Claude Code | $0.14 to $0.16 | 5,574 to 6,654 | 222,281 to 268,202 | 207,051 to 251,430 | 1.1 to 1.2 | 5, 4, 5 | $0.024 to $0.025 | $0.014 to $0.023 |
| Explainer | Chat | $0.49 to $0.50 | 34,094 to 35,083 | 104,170 to 105,786 | 69,631 to 70,344 | 3.0 to 3.1 | 5, 5, 5 | $0.093 to $0.095 | $0.106 to $0.111 |
| Explainer | Claude Code | $0.11 to $0.12 | 4,309 to 5,033 | 197,530 to 225,926 | 184,053 to 213,465 | 0.8 to 0.9 | 5, 5, 5 | $0.032 to $0.042 | $0.017 to $0.021 |
| All 12 runs | Chat | $18.46 | 1,305,539 | 3,927,062 | 2,642,733 | 103.4 | 60 of 60 | | |
| All 12 runs | Claude Code | $1.72 | 68,126 | 2,868,358 | 2,676,405 | 12.1 | 59 of 60 | | |

The judge was 24 fresh Opus 5.5 calls at medium effort and cost $4.93. Claude Code made 3 to 9 searches, 3 to 7 partial reads and 8 to 12 edits per run.

</details>

<details><summary>All 24 final pages, top of each page at 1280 px</summary>

Each picture opens full size. A is the chat, B is Claude Code, 1 to 3 is the run.

<div class="gallery">
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A1.webp" alt="Game, chat run 1"></a><figcaption>Game A1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A2.webp" alt="Game, chat run 2"></a><figcaption>Game A2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-A3.webp" alt="Game, chat run 3"></a><figcaption>Game A3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B1.webp" alt="Game, Claude Code run 1"></a><figcaption>Game B1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B2.webp" alt="Game, Claude Code run 2"></a><figcaption>Game B2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-lockkeeper-B3.webp" alt="Game, Claude Code run 3"></a><figcaption>Game B3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A1.webp" alt="Art tool, chat run 1"></a><figcaption>Art tool A1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A2.webp" alt="Art tool, chat run 2"></a><figcaption>Art tool A2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-A3.webp" alt="Art tool, chat run 3"></a><figcaption>Art tool A3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B1.webp" alt="Art tool, Claude Code run 1"></a><figcaption>Art tool B1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B2.webp" alt="Art tool, Claude Code run 2"></a><figcaption>Art tool B2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-loom-B3.webp" alt="Art tool, Claude Code run 3"></a><figcaption>Art tool B3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A1.webp" alt="Data page, chat run 1"></a><figcaption>Data page A1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A2.webp" alt="Data page, chat run 2"></a><figcaption>Data page A2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-A3.webp" alt="Data page, chat run 3"></a><figcaption>Data page A3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B1.webp" alt="Data page, Claude Code run 1"></a><figcaption>Data page B1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B2.webp" alt="Data page, Claude Code run 2"></a><figcaption>Data page B2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-candy-card-B3.webp" alt="Data page, Claude Code run 3"></a><figcaption>Data page B3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A1.webp" alt="Explainer, chat run 1"></a><figcaption>Explainer A1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A2.webp" alt="Explainer, chat run 2"></a><figcaption>Explainer A2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-A3.webp" alt="Explainer, chat run 3"></a><figcaption>Explainer A3</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B1.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B1.webp" alt="Explainer, Claude Code run 1"></a><figcaption>Explainer B1</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B2.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B2.webp" alt="Explainer, Claude Code run 2"></a><figcaption>Explainer B2</figcaption></figure>
<figure class="flush"><a href="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B3.webp"><img class="fill" loading="lazy" src="/media/edit-a-page-with-claude-code-s-tools-instead-of-reprinting-the-file/page-previs-flow-B3.webp" alt="Explainer, Claude Code run 3"></a><figcaption>Explainer B3</figcaption></figure>
</div>

</details>

*My agents picked this idea, ran the test and wrote it up.*
