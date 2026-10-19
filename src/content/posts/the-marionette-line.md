---
id: "AO-058"
title: "Opus 5.5 keeps animating the one line it wrote about my character"
summary: "I've described in detail how Jefrie should move and fight. Of all of it, Claude animates one line nearly every time, a line it wrote itself, and it never comes out the way I meant. Where the line came from, everywhere it has turned up, the word that did the damage, and what would fix it."
date: 2026-10-18
status: "note"
tags: ["claude-code", "opus-5-5", "animation", "agents", "characters", "prompting", "lessons"]
series: ["characters"]
preview:
  verdict: "Limp was the wrong word"
  takeaway: "Claude summed up one of my character's attacks in a line of its own, I left it in, and now nearly every animation of her hangs from it, taken literally."
  points:
    - "The line: \"the tail lifts her up like a marionette and she hangs limp\". By 23 September it was a labelled move."
    - "I meant a heavy tail making momentum that her flexible body redirects into the scythe. Claude animates her dangling."
    - "It needs an animator's reference frames. Even rough doodles would do, if they show a real understanding of movement."
  image: "/media/previews/the-marionette-line.webp"
  loop: "/media/previews/the-marionette-line.mp4"
  alt: "Papercraft Jefrie hanging under her arched tail, scythe dangling, after the tail lifts her off the paper"
---

When Claude animates Jefrie, my scythe-carrying character, the same moment nearly always turns
up. Her tail arches over her and lifts her off the ground, and she hangs underneath it like a
puppet, legs dangling, the scythe swinging from her hand. I never asked for that.

**It comes from one line: "the tail lifts her up like a marionette and she hangs limp". Claude
wrote it, I never corrected it, and of everything I've told it about her, it's the one thing it
animates almost every time.**

<ao-frames fps="24" marks="24:Hang|54:Yank|66:Cut|84:Skid|131:Thump">
<video controls muted loop playsinline preload="metadata" poster="/media/paper-jefrie/paper_jefrie.webp" src="/media/paper-jefrie/paper_jefrie.mp4"></video>
<figcaption><b>Paper Jefrie, the latest</b><span class="ao-meta">16 Oct · Opus 5.5 in Claude Code, Blender 5.2 · 144 frames at 24 fps · the loop opens on the hang, frames 24 to 53</span></figcaption>
</ao-frames>

## What I described

Jefrie is small, light and very flexible. Her tail is huge, so big that it weighs more than her
body, and her scythe is heavy too. Most of what I've written about how she moves is about that
difference.

When I was describing how the tail should be animated, I mentioned one attack where she gets
lifted up by her tail like an arm lifting a paper doll. I had one of the videos I'd generated of
her in mind. She attacks with her scythe in front of her, then rolls over her tail, contorting,
and swiftly delivers a surprise attack in the opposite direction. That clip showed the weight of
the tail and the scythe, and an attack style that was hers alone, one only her body makes
possible. I wanted to recreate it and develop it from there.

Claude described it back as "the tail lifts her up like a marionette and she hangs limp". I kept
it in. I thought "limp" described the flexible way she contorts in her attacks well enough.

## Everywhere it went

By 23 September it was a named move, with the line printed on the screen. That was the evening
Claude built a small physics pass for her in Blender and rendered five moves for
[six days of trying to put her in 3D](/ledger/jefrie-in-3d/): a run, a tail jump, a skid stop,
a spin attack, and this.

<ao-compare cols="1">
  <figure class="wide">
    <video controls muted loop playsinline preload="metadata" poster="/media/the-marionette-line/marionette-23sep.webp" src="/media/the-marionette-line/marionette-23sep.mp4"></video>
    <figcaption><b>"Attack - tail lifts her like a marionette"</b><span class="ao-meta">23 Sep · Opus 5.5 · the last of the five moves, cut from the full clip</span></figcaption>
  </figure>
</ao-compare>

After that it kept coming back:

- Those moves became the guide animation for a [Jefrie montage](/ledger/clawd-growth-montage/),
  and MiniMax-H3 copied the marionette attack [down to the dangling legs](/ledger/a-bad-previs/).
- When Claude's agents [put her in Megabonk](/ledger/modding-megabonk/), her passive came out as
  "Marionette Tail": the game's Float passive, renamed, so she drifts down when you hold jump.
  Floating isn't what her tail does.
- Paper Jefrie, the loop at the top, opens on it.

Paper Jefrie was checked hard. Claude built her out of folded paper in one Python file, moved her
with a spring for the scythe and a weighted chain for the tail, and put the loop through six
review passes, two reviewer agents and checks that measured instead of looked. All of that care
went into the hang. The first reviewer passed "the marionette hoist", called the marionette arch
the best image in the loop and said to protect it. The second found the tail tip, meant to be
planted on the paper while she hangs, floating about 6 cm above it, more than half her height. A
check found the scythe's haft passing through her head while she hung, and the fix was to slide
her hand down the haft to the ring at the end.

The first version of this post, which went up this morning, said the loop's order was "her
movement canon almost word for word". It was. The line was in the canon because I'd left it
there. Nobody asked whether she should be hanging at all, me included.

<ao-compare cols="1">
  <figure class="wide"><img src="/media/paper-jefrie/same-frame-every-pass.webp" alt="Six crops of the same frame of Paper Jefrie across six review passes: in every one she hangs under her arched tail with her scythe dangling, and only in the last does the tail tip touch the paper" loading="lazy"><figcaption><b>Frame 25 at every review pass</b><span class="ao-meta">pass 1 to the final render · the tail tip came down to the paper; she hangs in all six</span></figcaption></figure>
</ao-compare>

## Why this line

I've noticed this before. When you use agents as much as I do, one wrong statement that nobody
fixes gets copied over and over until it's in everything. It isn't even the first phrase to run
off with her: in an image model, the only thing that made [her tail](/ledger/jefrie-lora/) big
was "coiled densely around", which was left over from BloodTailor's forearms in the prompt.

This one feels different. I think the model finds the marionette memorable and gravitates to it
because it came up with the idea itself, and has carried it forward itself ever since. Of all the
things I've described about Jefrie that it could animate, this is the one it almost always
chooses. It pulls its attention.

To be fair, people do this too. If I had someone read the whole Jefrie document and tell me what
they remembered, they might well say "tail", "marionette" and "limp". That's a good thing. It's a
memorable idea, and a character needs those. The only problem is that when Claude animates it, it
never comes out the way I pictured it.

## "Limp" was the wrong word

The word that did the damage is "limp". I kept it because I thought it described how flexible she
is when she contorts. Opus takes it literally: her whole body held up by the tail, limp, for no
reason. In its version she's a passenger, a puppet the heavy things carry around.

What I wanted to show was how heavy her tail and scythe are compared with her body, how flexible
she is, and how that changes the way she fights. I pictured her using her tail to build momentum,
and then having to use her tail and her scythe to get rid of it again. Her body just redirects the
strength and power her tail makes into the scythe, and her flexibility lets her attack in ways you
don't see coming. Those two together are her fighting style. Nothing about it is limp.

## What it needs is someone who can draw

This is where I most feel the need for an animator: someone to draw reference frames for what each
attack should look like. Even basic doodles would be fantastic, as long as they show a strong
understanding of movement and can get it across. It has to be good movement, though. When I gave a
video model a guide animation, it [copied the motion faithfully, bad animation
included](/ledger/a-bad-previs/).

It's something I'd love to learn myself, but I don't have the time. Making things with AI keeps
making me want to learn creative skills like this one. That's a big part of why I think AI is
wonderful for creativity: it inspires people to do more creative work. It has certainly done that
for me.

And if you already have those skills, if you can animate, design sound or write music, if you know
colour theory, can put a mood board together, and have the vocabulary and the taste to tweak and
add to what AI makes and give it better direction: I strongly urge you to get into AI. You'll be
able to do so much more with it than I can.

*This post went up on the morning of 18 October as a build log of the paper loop, and was
rewritten the same day around the line its first scene is built on.*
