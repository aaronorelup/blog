---
id: "AO-003"
title: "The one-shot game that worked, and the one that didn't"
summary: "A skateboarding wizard in Venice Beach, built in a single prompt in one evening. Then I ran the same prompt with four more districts in it, and the parts I hadn't changed got worse too — which is the actually useful part."
date: 2026-08-02
status: "shipped"
tags: ["claude-code", "three-js", "gamedev", "elevenlabs", "lessons"]
preview:
  verdict: "Bigger prompt, worse game"
  takeaway: "A one-shot build spends care, not specificity, and the care is global: asking for more districts made Kai's dialogue, the shop jokes and the camera worse too."
  points:
    - "The friend scene read the same in both prompts. The small game paused for it; the big one let Kai roll off screen."
    - "What fits one prompt: about fifteen minutes of game, two districts, a handful of systems, one joke per location."
    - "To check if you overshot, don't inspect what you added. Look at something you didn't touch and see if it still works."
---

I was messing around with Sora, trying to find prompts that produced something interesting,
and I asked it for a skateboarding wizard in Venice Beach casting fireballs at homeless
people.

It did a great job. And the image stuck with me for weeks — it just looked *fun*. So
eventually I built the game.

You can [play it here](/games/grind-and-grimoire/). It's about fifteen minutes. Keyboard and
mouse, sorry.

## What it is

You're Kai, a skateboarding wizard with a 2 AM open-mic slot and no poem written. You have
until then to skate Venice and Santa Monica, collect twelve pieces of inspiration, and
survive the boardwalk.

Grind on anything with an edge — curbs, cars, benches, string lights strung between
buildings, the VENICE sign. Fireball the fiends. Refill your mana at food shops, because
that's the only place it refills. Buy drip with the cash the fiends drop, and then every
piece of clothing earns you exactly one unique compliment from a stranger on the street,
which raises your EGO, which maxes your stats and makes your fireballs bigger.

Kai hates this. He says so.

That last mechanic is lifted, with affection, from
[**Bum Bag Bangin'** by SeaDads](https://seadads.itch.io/bum-bag-bangin) — a Ludum Dare 40
game I've loved for years, where you're a guy walking to work in a genuinely excellent bum
bag and the compliments are the *hazard*. Too many and your head swells. I inverted it:
here the compliments buff you, and the joke is that your wizard resents being helped by
them.

Everything you see is procedural. No downloaded models, no textures, no asset packs — every
building, sign, and facade is painted to a canvas at runtime. All 76 audio assets (51 voice
lines, 22 sound effects, 3 music tracks) came out of the ElevenLabs API.

## The prompt was the whole thing

I've seen people describe one-shot game generation as a kind of magic trick. It isn't. The
result was good because the prompt was long and specific, and for no other reason.

I didn't ask for "a skateboarding game." I named every mechanic. Skating, grinding on rails
and sidewalks and cars, wall-jumping off buildings. I specified the restaurants you could go
into — and I specified **the joke that happens at each one**. I specified the clothing shops,
and the compliment loop, and that the character should comment on his own ego inflating.

Then Fable 5 wrote the actual lines, and this is the part I didn't expect: it is genuinely
funny. The voice lines land. The shop scenes land. I gave it the shape of every joke and it
filled them in better than I would have.

I don't think that contradicts what I found building [BLACKWATER](/ledger/blackwater-weekend/) —
that the model resists creative writing. It's the same finding with the constraint changed.
Here every piece of writing was small, bounded, and pinned to a mechanic I'd already
specified. That's not a long-horizon creative task. That's filling in a form, and it's
excellent at filling in forms.

## Then I got greedy

I was so happy with how this came out that I ran it again, bigger.

Same model, same settings — Fable 5, ultracode, maximum reasoning. Same prompt, too, with one
change: I added more detail. The small game only needed downtown and the beach. The big one
asked for six districts, including a suburb, the city drainage system, and a park, and I
described what I wanted in each of them at much greater length.

I got a world about three times the size.

The map had holes — buildings that should have been there and weren't. Clothing lines strung
between nothing, floating in mid-air. The park was giant and empty: no trees, no benches, no
paths.

That much I could explain to myself. More ground to cover, less care per square foot. Fine.

Here's what I didn't expect. The parts I hadn't changed got worse too.

Kai was less likeable. The store owners had no good jokes. The cutscene camera work was far
worse. A pile of small touches that made the first one feel finished were simply missing, and I
couldn't point at the line in the prompt that had asked for any of it to change, because there
wasn't one.

The clearest one is the friend scene. In the small game, when you stop to talk to your friend,
the game pauses so you can watch it. I never asked for that. It just did it. In the big game
there's no pause — but you also can't steer during the conversation, so Kai keeps his momentum,
rolls off the edge of the screen, and the whole thing plays out with him somewhere off camera.

Nothing in the prompt about that scene had changed. It got worse anyway, while the model was
busy somewhere else in the city.

The obvious lesson from a bad generation is that your prompt wasn't specific enough. I believed
that. This run disproves it: I wrote a more specific prompt and got a worse game, including in
the parts both prompts described the same way.

So what a one-shot build spends isn't specificity. It's care, and the care is global. Adding a
district doesn't cost you a district; it costs you everywhere. I didn't buy a bad park and keep
everything else intact. I paid for that park out of Kai's dialogue, the shop scenes, and the
camera.

It isn't a ceiling on what the model can do, either. The small run wrote dialogue funnier than
what I'd have written and I hadn't specified a line of it. There was room to spare. Nothing
about the big run says it couldn't have done that again. It says it was busy.

That failure is what sent me down the road that became BLACKWATER — built iteratively, with
developer tools and tests requested *first*, so I could see and fix what the model couldn't.
Those are the same project in a sense. This one is the control group.

## The size rule

So here's the thing I'd tell anyone trying this.

**One-shot generation works, and the constraint is scope, not ambition.** I still think that's
right. I just had the mechanism backwards. Scope isn't a cap on how much you get out. It's a
setting on how much care every part of the build gets, and you change it for the whole build at
once.

If you want a genuinely good game out of a single prompt, it has to be about this big — roughly
a fifteen-minute experience, two districts, a handful of interlocking systems, one joke per
location. At that size you can be specific about everything, and specificity is the whole input.
It's the whole input only because at that size it's still affordable.

The first things to go are the ones you never asked for, and in the small game those are a lot
of what makes it good. I couldn't have listed them in advance either. I didn't know they were
there until they were missing.

Go bigger and you don't get a bigger version of this. You get slop, and not only in the parts
you added. So the way to check whether you've overshot isn't to inspect the new stuff. It's to
go look at something you didn't touch and see whether it still works.

Also: give it the ElevenLabs API. That's not scope-dependent. That's just always right.

## Why I keep doing this

Honestly, mostly because it's fun, and because there's something specific and good about
watching an idea you've been carrying around turn into a thing you can actually load and
play.

This one took an evening. About four and a half hours from the first file to the last,
which is longer than the hour I remembered and still absurdly short for what came out.

I'd like to do more at this size.
