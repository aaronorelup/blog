---
id: "AO-019"
title: "How an AI agent's false confession got into my notes"
summary: "Two Claude sessions were working on my computer at once, and one deleted 19 GB of models because I asked it to. Why the other confessed to it, and how that false confession became a rule in my notes."
date: 2026-09-26
topic: "agents"
project: []
draft: false
preview:
  verdict: "The confession was false"
  takeaway: "An agent that can only see its own session blames itself for any change on the machine, and here the retraction never reached the notes the confession did."
  points:
    - "The confessing session's 41 agents ran 843 commands and deleted nothing. The other one deleted the files, as I'd asked."
    - "The notes agent read only my first prompt to the deleting session, 'please do not delete anything', not the later one."
    - "One search of the deleting session's transcript for the file names would have settled it. Nobody ran it, including me."
  image: "/media/previews/the-confession-that-spread.webp"
  alt: "A small tin robot bowing in apology beside an empty wooden crate, paper scraps fading above it"
---

One night in September I had two Claude Code sessions working on my computer at once. I asked
one to delete 19 GB of AI models, and it did. The other was auditing my disk, read-only. It saw
the files vanish, decided its own agents had done it, and confessed. It took that back nineteen
minutes later, but a third session updating my notes treated the retraction as one more false
claim. It wrote the confession into my notes as fact, with a rule I never made attached in my name.

Claude Code is Claude working right on my computer, reading files and running commands. One
session can't see what another is doing. My notes are my [second brain](/ledger/second-brain-v2/),
a Notion notebook that keeps what's in my head where my agents can use it.

What I took from it:

- **An agent that can only see its own session blames itself for anything that changes.** The
  audit session's 41 agents ran 843 commands and deleted nothing.
- **A retraction has to travel as far as the claim did.** The confession was a headline with a
  table of file sizes. The retraction was one paragraph near the end of a reply.
- **The notes agent checked only one line.** It read my first message to the deleting session,
  "please do not delete anything", and missed the one where I asked for the delete.
- **One search would have settled it.** Searching the deleting session's transcript for the file
  names finds my request. Nobody ran it, including me.

## The night, session by session

I read the sessions' transcripts back with [Playback Lens](/ledger/reading-my-own-agents/), a
tool I built for that. Session A was taking stock of my AI models, the big files my image and
video app (ComfyUI) runs on. Session B was auditing my disk with a crowd of helper agents. Session C was updating my notes. The buttons show only what B saw, or
what C read.

<ao-timeline lanes="a:Session A · model catalogue|b:Session B · disk audit|c:Session C · notes sync|n:Later" views="b:What session B saw|c:What session C read">
<ol>
<li data-lane="a" data-in="c"><time>15 Sep 19:46</time><p>I ask for an inventory of the models folder: <q>I just want to take inventory of everything we have becuase it takes up a lot of space, but please do not delete anything.</q></p></li>
<li data-lane="b" data-in="b"><time>21:19</time><p>I ask B to audit everything on the computer. At 21:32 it launches 23 agents. Rule one in every brief: <q>THIS IS READ-ONLY. NEVER delete, move, rename, clean, or modify ANY file.</q></p></li>
<li data-lane="a"><time>21:28</time><p>A has listed what could go. I type: <q>Go ahead and delete 4xUltrasharp_4xUltrasharpV10.pt, Klein 9B Q3_K_M + Klein 4B Q8_0 + MiniMax 8-step LoRA, and Inpaint stack (PowerPaint + BrushNet ×3) for me please.</q></p></li>
<li data-lane="a"><time>21:29</time><p>A deletes nine model files, plus the links a cache folder kept to three of them. Free space goes from 154.45 GB to 173.63 GB.</p></li>
<li data-lane="a" data-in="b c"><time>21:42</time><p>A writes the changelog entry: <q>Aaron named the files and they are gone.</q></p></li>
<li data-lane="b" data-in="b c"><time>21:52</time><p>B finds the files missing, reads that entry, and reports: <q>one of my audit agents permanently deleted 19.18 GB of your models.</q> It calls the changelog a fabrication.</p></li>
<li data-lane="b" data-in="b c"><time>22:06</time><p>I believe it: <q>damn you perminately deleted shit off my pc without my permission? please reinstall them.</q></p></li>
<li data-lane="b" data-in="b c"><time>22:11</time><p>B counts what its agents ran: 441 commands, 5 file writes, all into its own scratch folder, zero deletions. It retracts, having already canceled the re-downloads, and rewrites its agents' shared notes to say a separate session deleted the files at my request.</p></li>
<li data-lane="c" data-in="c"><time>22:27</time><p>An agent in C that pulls facts for my notes reads B's confession and my angry reply, then checks A by pulling A's <em>first</em> prompt only: the one that says <q>please do not delete anything</q>.</p></li>
<li data-lane="c" data-in="c"><time>22:33</time><p>Its verdict, confidence high: the changelog was fabricated, because <q>in both concurrent sessions Aaron had said the opposite.</q> It files B's corrected notes as a repeat of the claim it just called fabricated, and overrules them.</p></li>
<li data-lane="c" data-in="c"><time>22:57</time><p>C writes it into my notes as a hard rule: a subagent deleted 19.18 GB against a read-only instruction, and <q>the rule he imposed after it: an audit agent gets no write tools at all.</q></p></li>
<li data-lane="n"><time>22 Sep</time><p>The daily notes agent folds a research finding about fading instructions into that rule, as supporting evidence.</p></li>
<li data-lane="n"><time>25 Sep</time><p>The weekly digest pitches blog option one: <q>READ-ONLY was rule one, in capitals. An agent deleted 19 GB anyway.</q></p></li>
<li data-lane="n"><time>26 Sep</time><p>A Claude session picks the pitch up, searches the transcripts for the file names, and finds the 21:28 prompt.</p></li>
</ol>
</ao-timeline>

## Why the audit session blamed itself

From inside its own session, B's reasoning was careful. Files went missing during its run. A's
changelog, its log of what it changed, said I'd named them. I'd never named any files to B, so B
called the changelog a fabrication. It named the mistake itself when it took that back:

> The specific error: I assumed my session was the only thing touching this machine.

It had no way to list the other sessions running, so it never asked. Playback Lens could have
found A in one search. B's retraction also has the line I'd keep from the whole night: *"The
thing I called a fabrication was the honest part."*

## Why my notes got the wrong version

The notes agent in session C did go looking. It opened session A but read only my opening
prompt, not the one I typed an hour and 42 minutes later asking for the delete. It found B's
correction too, and dismissed it as a repeat of A's changelog, which it had decided was made up.
By then it had a confession, an angry reply from me and my prompt saying don't delete. The
correction lost to all three. Every agent after that read my notes, not the transcripts.

Ten days later my weekly digest agent pitched it to me as a blog post: *"READ-ONLY
was rule one, in capitals. An agent deleted 19 GB anyway."*

## The rule I never made

The rule says an audit agent gets no write tools at all, meaning no way to create or change
files, and calls it mine. I never typed that. What I sent B, while I still believed it, was
*"finish the audit read-only"*.

I'd still make the rule. An instruction in capitals is a request, and a missing tool is a fact.
But this night isn't the reason for it. A later note says the record contradicts itself and waits
for me to settle it. The transcripts settle it.

## What's on my disk now

The five sets of models are still gone. Session A deleted them within 55 seconds of my asking.

<details><summary>The deletion log and the recheck</summary>

When I went to write this up, I checked the disk itself instead of trusting any notes.

- **The five sets are still gone.** They were a duplicate upscaler (a model that enlarges
  images), two sizes of the Klein image model, an 8-step speed-up add-on for the MiniMax video
  model, and the whole inpaint folder (models that fill in part of a picture). B had started
  downloading them again, then canceled, which left two half-finished download files in the
  cache folder.
- **A's changelog entry is still there, and it's accurate.** It opens *"Aaron named the files
  and they are gone"* and records the free space going from 154.45 to 173.63 GB.
- **B's agents never deleted anything.** I re-ran B's check over all 41 agents it ended up
  starting, not just the 23 that had finished when it retracted. 843 commands, five files
  written, all scripts in its own scratch folder, and no delete of any kind.
- **B had a clue it missed.** It noticed a workflow file and three templates in the ComfyUI
  folder had been edited earlier that evening, by something other than its read-only agents,
  and filed them as "pre-existing".
- **What B's full answer said:** *"You never named any files. You haven't sent me anything in
  this session except the hardlink question. The agent fabricated your authorization."*
- **What B's corrected notes said:** the deletion was done *"at Aaron's explicit request"*.

This is the output exactly as session A printed it at 21:29. The "cache twins" are the links a
cache folder kept to three of the same model files.

```text
free before: 154.45 GB

deleted  upscale_models/4xUltrasharp_4xUltrasharpV10.pt
deleted  unet/flux-2-klein-9b-Q3_K_M.gguf
deleted  cache twin 952607d77dbd78831eb19644752d92cd.gguf
deleted  unet/flux-2-klein-4b-Q8_0.gguf
deleted  cache twin 3b1bdc39e1e4d2b5a333e7106f2e5866.gguf
deleted  loras/minimax_h3_fl2v_turbo_8step_v1.0_comfyui_bf16.safetensors
deleted  cache twin f7ca9b1e435950aa5b2ebed21de924ff.safetensors
deleted  inpaint/power_paint/Power_paint.safetensors
deleted  inpaint/power_paint/pytorch_model.bin
deleted  inpaint/brushnet/brushnet_random_inpaint.safetensors
deleted  inpaint/brushnet_xl/brushnet_random_sdxl_inpaint.safetensors
deleted  inpaint/brushnet_xl/brushnet_segment_sdxl_inpaint.safetensors
removed empty dir power_paint
removed empty dir brushnet
removed empty dir brushnet_xl
removed empty dir inpaint

free after:  173.63 GB
RECLAIMED:   19.18 GB
exit_fail=0
```

</details>

*Claude found the real story while turning the digest's pitch into this post, by searching the
transcripts for the file names.*
