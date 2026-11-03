---
id: "AO-003"
title: "How big a game one AI prompt can build"
summary: "I had Claude build a skateboarding wizard game from one long prompt in an evening, then ran it again asking for six districts instead of two. How big a one-prompt game can get, and what broke."
date: 2026-08-02
topic: "games"
project: []
preview:
  verdict: "Bigger prompt, worse game"
  takeaway: "Asking for six districts instead of two made the whole game worse, even the hero's lines, the shop jokes and the camera, which I hadn't changed."
  points:
    - "One prompt holds about fifteen minutes of game, two districts, a few systems and one joke per location."
    - "To check if you asked for too much, look at something you didn't change and see if it still works."
    - "I gave it the shape of every joke and it wrote funnier lines than I would have."
  image: "/media/previews/grind-and-grimoire.webp"
  alt: "A blocky wizard in a purple robe and pointed hat skateboarding on a boardwalk outside a coffee shop"
---

I had Claude build a skateboarding wizard game from one long prompt in one evening, about four
and a half hours. It came out good, and honestly funny. Then I ran the same prompt asking for six
districts instead of two, and **the whole game got worse**, even the jokes and camera work in
parts I hadn't changed.

So one prompt can make about fifteen minutes of good game, and the way to tell you asked for too
much is to check something you didn't touch. The small one is Grind & Grimoire, and you can
[play it here](/games/grind-and-grimoire/) with a keyboard and mouse.

<figure class="wide">
  <img src="/media/grind-and-grimoire/card.webp" alt="A blocky wizard in a purple robe and pointed hat skateboarding on a boardwalk outside a coffee shop" loading="lazy">
  <figcaption><b>Grind & Grimoire</b><span class="ao-meta">Kai on the boardwalk outside Lala's Latte, one of the food shops where his mana refills</span></figcaption>
</figure>

What I took from it:

- **One prompt holds about fifteen minutes of game.** Two districts, a few systems, one joke per
  location.
- **Asking for more costs you everywhere**, not only in the parts you added.
- **To check if you overshot, look at something you didn't change.**
- **Give it the shape of every joke.** It wrote funnier lines than I would have.
- **Always let it use ElevenLabs**, an AI voice, sound and music service, whatever the size.

## What the game is

You're Kai, a skateboarding wizard with a 2 AM open-mic slot and no poem. You skate Venice and
Santa Monica collecting twelve pieces of inspiration and fighting off fiends with fireballs. They
drop cash, and you spend it on clothes. Every piece of clothing gets you one compliment from a
stranger, which raises your EGO stat and makes your fireballs bigger. Kai hates this. He says so.

The compliment idea comes from [Bum Bag Bangin'](https://seadads.itch.io/bum-bag-bangin) by SeaDads,
a game I've loved for years, where compliments on your bum bag are the danger. I turned it around
so they help you, and Kai resents it.

<details><summary>Everything in it</summary>

- You grind on curbs, cars, benches, string lights strung between buildings and the VENICE sign.
- Your mana only refills at food shops.
- Every piece of clothing earns exactly one unique compliment. EGO maxes out your stats and
  makes your fireballs bigger.
- Bum Bag Bangin' was made for Ludum Dare 40, a weekend game-making contest. You're a guy
  walking to work in a really good bum bag. Too many compliments and your head swells.
- Everything you see is drawn by code while the game runs. No downloaded 3D models, no textures,
  no asset packs.
- All 76 sounds came from the ElevenLabs API: 51 voice lines, 22 sound effects and 3 music
  tracks.

</details>

The idea came from asking Sora, OpenAI's video generator, for a skateboarding wizard in Venice
Beach casting fireballs, and the result stuck with me for weeks.

## The prompt named everything

The small game came out good because the prompt was long and specific. It named every mechanic,
every restaurant and the joke that happens at each one, and it said Kai should comment on his own
ego getting bigger. Then Fable 5, one of Claude's models, wrote the actual lines, and they land.

On [BLACKWATER](/ledger/blackwater-weekend/), my cave-diving zombie game, it coasted on long
creative work. Here every bit of writing was small and pinned to a mechanic. That's closer to
filling in a form, and it's great at filling in forms.

## The bigger version

I used the same model and settings both times, with effort and thinking turned all the way up.
The prompt had one change. The small game only needed downtown and the beach. The big one asked
for six districts, including a suburb, the city drainage system and a park, each in a lot more
detail.

The world came out about three times the size, with holes where buildings should be, clothes
lines floating in mid-air and a huge empty park. That part made sense to me. But Kai was less
likeable, the shop owners had no good jokes and the camera in the story scenes was much worse.
No line in the prompt asked for any of that to change.

## The friend scene

In the small game, when you stop to talk to your friend, the game pauses so you can watch. I
never asked for that. In the big game there's no pause and you can't steer, so Kai rolls off
screen and the scene plays out with him off camera. The prompt for that scene hadn't changed.

## Why I think it happens

The usual advice for a bad result is a more specific prompt. I wrote one and got a worse game. I
think one prompt has a set amount of care for the whole game, so I paid for that park out of
Kai's dialogue, the shop scenes and the camera. The first things to go are the touches you never
asked for, and you don't know they were there until they're missing.

I built BLACKWATER the other way, step by step. I asked for developer tools and tests first, so I
could see and fix what the model couldn't.
