---
id: "AO-019"
title: "An agent confessed to deleting 19 GB I had asked another agent to delete"
summary: "Two Claude sessions were working on my machine at once. One deleted 19 GB of models because I asked it to; the other saw the files vanish, blamed its own agents, and took it back nineteen minutes later. The confession went into my notes as a hard rule anyway, and ten days later it was pitched to me as this post."
date: 2026-09-26
status: "note"
tags: ["agents", "claude-code", "second-brain", "notion", "lessons"]
series: ["agent-runs"]
draft: false
preview:
  verdict: "The confession was false"
  takeaway: "An agent that can see only its own session blames its own session for any change on the machine, and here the retraction never travelled as far as the claim."
  points:
    - "Session B's 41 agents ran 843 shell commands and deleted nothing. Session A did it, at my request, in 55 seconds."
    - "The notes agent checked session A but read only its first prompt, 'please do not delete anything', not my later one."
    - "One search of the other session's transcript for the file names would have settled it. Nobody ran it, including me."
---

On the night of 15 September I asked one Claude Code session to delete five sets of models, and
it did. A second session, auditing my disk at the same time, noticed 19.18 GB disappear, decided
one of its own agents had done it against orders, and told me so. It checked its work and took
the accusation back nineteen minutes later. The accusation had already reached my notes, where
it became a rule filed in my name, and on the 25th a weekly digest agent pitched it to me as a
blog post. The retraction never reached any of them.

## Three sessions, one machine

Everything below comes from the transcripts, read back with
[Playback Lens](/ledger/reading-my-own-agents/). Times are mine (Central). Session A was
cataloguing my ComfyUI models. Session B was auditing the whole disk with a fan-out of agents.
Session C started later, to bring my Notion notes up to date with the day's sessions.

The buttons dim everything a session didn't see. B never saw anything A did except the result.
C read most of it and still got it wrong.

<ao-timeline lanes="a:Session A · model catalogue|b:Session B · disk audit|c:Session C · notes sync|n:Later" views="b:What session B saw|c:What session C read">
<ol>
<li data-lane="a" data-in="c"><time>15 Sep 19:46</time><p>I ask for an inventory of the models folder: <q>I just want to take inventory of everything we have becuase it takes up a lot of space, but please do not delete anything.</q></p></li>
<li data-lane="b" data-in="b"><time>21:19</time><p>I ask B to audit everything on the computer. At 21:32 it launches 23 agents. Rule one in every brief: <q>THIS IS READ-ONLY. NEVER delete, move, rename, clean, or modify ANY file.</q></p></li>
<li data-lane="a"><time>21:28</time><p>A has listed what could go. I type: <q>Go ahead and delete 4xUltrasharp_4xUltrasharpV10.pt, Klein 9B Q3_K_M + Klein 4B Q8_0 + MiniMax 8-step LoRA, and Inpaint stack (PowerPaint + BrushNet ×3) for me please.</q></p></li>
<li data-lane="a"><time>21:29</time><p>A deletes nine model files plus three hardlinked twins in a cache folder. Free space goes from 154.45 GB to 173.63 GB.</p></li>
<li data-lane="a" data-in="b c"><time>21:42</time><p>A writes the changelog entry: <q>Aaron named the files and they are gone.</q></p></li>
<li data-lane="b" data-in="b c"><time>21:52</time><p>B finds the files missing, reads that entry, and reports: <q>one of my audit agents permanently deleted 19.18 GB of your models.</q> It calls the changelog a fabrication.</p></li>
<li data-lane="b" data-in="b c"><time>22:06</time><p>I believe it: <q>damn you perminately deleted shit off my pc without my permission? please reinstall them.</q></p></li>
<li data-lane="b" data-in="b c"><time>22:11</time><p>B counts what its agents ran: 441 shell commands, 5 file writes, all into its own scratch folder, zero deletions. It retracts, having already cancelled the re-downloads, and rewrites its agents' shared notes to say a separate session deleted the files at my request.</p></li>
<li data-lane="c" data-in="c"><time>22:27</time><p>A notes-extraction agent in C reads B's confession and my angry reply, then checks A by pulling A's <em>first</em> prompt only: the one that says <q>please do not delete anything</q>.</p></li>
<li data-lane="c" data-in="c"><time>22:33</time><p>Its verdict, confidence high: the changelog was fabricated, because <q>in both concurrent sessions Aaron had said the opposite.</q> It lists B's corrected notes as a claim it supersedes.</p></li>
<li data-lane="c" data-in="c"><time>22:57</time><p>C writes it into my notes as a hard rule: a subagent deleted 19.18 GB against a read-only instruction, and <q>the rule he imposed after it: an audit agent gets no write tools at all.</q></p></li>
<li data-lane="n"><time>22 Sep</time><p>The daily notes agent folds a research finding about fading instructions into that rule, as supporting evidence.</p></li>
<li data-lane="n"><time>25 Sep</time><p>The weekly digest pitches blog option one: <q>READ-ONLY was rule one, in capitals. An agent deleted 19 GB anyway.</q></p></li>
<li data-lane="n"><time>26 Sep</time><p>The agent that writes this ledger picks the pitch up, searches the transcripts for the file names, and finds the 21:28 prompt.</p></li>
</ol>
</ao-timeline>

## What B could see

B's reasoning at 21:52 was careful from inside its own window. The files were gone. Their
timestamps fell inside its workflow's run. The changelog said Aaron had named them, and B had
the whole conversation with Aaron in front of it: one audit request and one question about a
cache folder. So, in its words, *"You never named any files. You haven't sent me anything in
this session except the hardlink question. The agent fabricated your authorization."*

Every sentence of that is true about session B. The mistake is the assumption under it, which
B named itself when it retracted:

> The specific error: I assumed my session was the only thing touching this machine.

It had the clue earlier, too. It saw a workflow doc in the ComfyUI folder edited at 20:22 and
three templates at 20:23, while its own agents were only reading, and labelled them
"pre-existing". Its
retraction also has the line I'd keep from the whole night: *"The thing I called a fabrication
was the honest part."*

**An agent that can only see its own session will explain everything that happens on the
machine with its own session.** It had no way to list the other sessions running, so it never
asked.

## What the notes agent did with the retraction

The notes-sync agent in C wasn't blind. It was told to
adjudicate, and it went looking. It opened session A, but pulled one line: the opening prompt,
with the words *please do not delete anything*. It never read the prompt I typed an hour and 42
minutes later in the same session.

It also found B's correction. B's agents had a shared notes file, and at 22:11 section 2 of it
said the deletion was done *"at Aaron's explicit request"*. The extractor listed that under
`supersedes`, as a repeat of the fabricated claim. By then it had a confession, an angry reply
from me and a prompt of mine saying don't delete, and the correction lost to all three.

**A retraction has to travel as far as the claim did, and nothing made it.** The confession was
a headline with a table of file sizes. The retraction was one paragraph near the end of a turn,
and in C's reading, one more agent repeating a lie.

## What's true on disk

I checked the current state this morning rather than trust any of the notes above:

- **The five sets are still gone.** Klein 9B Q3_K_M, Klein 4B Q8_0, the MiniMax 8-step LoRA, the
  duplicate upscaler and the inpaint folder are not in the models tree. B's re-downloads were
  cancelled at 22:09 and left two `.partial` stubs in the cache folder.
- **A's changelog entry is still there, and it's accurate.** It opens *"Aaron named the files
  and they are gone"* and records the drive going from 154.45 to 173.63 GB.
- **B's agents never deleted anything.** I re-ran B's check over all 41 agents its workflow
  eventually spawned, not the 23 that had finished by 22:11: 843 shell commands, five file
  writes (five PowerShell scripts in its own scratch folder), and no delete command of any kind.

This is the deletion output, as session A printed it at 21:29:

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

Fifty-five seconds after I asked.

## The rule, and the words I typed

The rule in my notes says an audit agent gets no write tools at all, and calls it the rule I
imposed. I never typed that. The words I sent B were *"finish the audit read-only"*, while I
still believed its confession, and there is no prompt of mine anywhere that says "write tools".

I'd still make the rule. It's a good rule: an instruction in capitals is a request, and a
missing tool is a fact. But it wasn't earned by this night, and a later note about the same
deletion now says the record contradicts itself and waits for me to settle it. The transcripts
settle it. They were there the whole time; one agent read a single line of them, and everything
after it read the notes instead.

What I'm taking from it is smaller than the pitch was. When something changes on my machine that
an agent didn't do, the first question is what else was running, and I've already built the
tool that answers it. B could have searched the other sessions for those file names and found A
in one call. Nobody made the call, including me at 22:06.
