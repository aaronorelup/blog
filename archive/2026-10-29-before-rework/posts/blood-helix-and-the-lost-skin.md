---
id: "AO-006"
title: "The skin I gave up on, and the effect I barely described"
summary: "I gave it a misspelled username and a decade-old memory, then described a cosmetic effect only by its shape. It came back with my old Minecraft skin, a solved login mystery, and a working datapack."
date: 2026-08-07
status: "shipped"
tags: ["claude-cowork", "minecraft", "agents", "research"]
preview:
  verdict: "Skin recovered, worlds not"
  takeaway: "The login mystery was my own name: I'd been playing as Blooedtailor because my old account, still alive, held BloodTailor, skin and all."
  points:
    - "Via a 2018 Mojang email, Cowork traced the account to my old EarthLink address: recoverable if I get into that inbox."
    - "My old worlds were never stored server-side. If they survive at all, it's as a backup in the .minecraft saves folder."
    - "From 'an upside-down snowcone' it named Blood Helix, a Mineplex cosmetic, and rebuilt it as a working datapack."
  image: "/media/previews/blood-helix-and-the-lost-skin.webp"
  loop: "/media/previews/blood-helix-and-the-lost-skin.mp4"
  alt: "The rebuilt Blood Helix effect: a ring of red particles spiralling up around the BloodTailor Minecraft skin"
---

I've been sitting on this one for a couple of days because I genuinely didn't expect it to
go anywhere. I gave Cowork a message that, reading it back, is embarrassingly vague. And it
came back with my old Minecraft skin, an explanation for a decade-old login mystery I never
solved, and — a few messages later — a rebuilt, working copy of a cosmetic effect I could
only describe by its *shape*.

## Part one: the skin

Here's essentially what I said, typos and all:

> When I downloaded minecraft when it first came out. I made my own skin for it. Since then
> Minecraft has gone through tons of different updates and I ended up buying for the game
> again and creating a new account. I've never been able to figure out how to log into my
> old account because I don't even know what the account was actually for cus there are so
> many minecrafts now. I really want my old skin back, and if possible, to see my old
> worlds. Could you help me. It was when minecraft first came out and it was on windows
> desktop and I believe the username was bloodtailor.

That's it. No account ID, no email, not even a confident username — just "bloodtailor" and a
vague memory of "when Minecraft first came out."

It came back with the skin, pulled directly from Mojang's texture servers off the
`BloodTailor` account (UUID and all), saved and ready to load:

![The recovered skin rendered front, back, and flat](/media/blood-helix/bloodtailor-skin-preview-sheet.png)

That render comes off the actual 64×64 texture file — the thing Mojang stores, and the
thing you drop back into the game:

<img src="/media/blood-helix/bloodtailor-original-skin.png" alt="The raw 64×64 BloodTailor skin texture" width="256" height="256" style="image-rendering:pixelated" />

But the actual best part wasn't the skin — it was the explanation. It figured out that I'd
been playing under a *misspelled* version of my own name (`Blooedtailor`, with an extra "e")
this whole time, because the real `BloodTailor` name was locked by my own old, still-alive
account. It traced the account's name history, found an old Mojang email in my inbox from
2018 about an email change that never actually completed, and worked out that the account
almost certainly migrated to a Microsoft account tied to my old EarthLink address — meaning
it's recoverable if I can get back into that ancient email. It also went looking for my old
worlds, confirmed they were never stored server-side, and pointed me at exactly where a
backup would need to live if one exists (`AppData\Roaming\.minecraft\saves`).

I gave it a username and a decade-old memory. It gave me back a skin, a login mystery
solved, and a recovery plan.

## Part two: the effect I could only describe as an "upside-down snowcone"

Riding the high from part one, I decided to test it with something much harder to search
for. Years ago, on a server I misremembered as Hypixel (it was actually **Mineplex** —
Cowork caught that immediately from the specific minigames I described, Master Builders and
Super Smash Mobs), I'd unlocked a cosmetic: a swirl of blood-red particles that spun around
the player like an upside-down snowcone. I didn't know its name. I just described the shape.

It identified the cosmetic as **Blood Helix**, from Mineplex's Vampire 2000 set, and then
went a step further than I asked — it didn't just show me what it looked like, it **rebuilt
the effect as a working Minecraft datapack**, no mods required, and installed it directly
into all three of my current worlds.

Here's the first pass, built from nothing but the wiki description and my "snowcone"
description:

![Blood Helix, first pass render](/media/blood-helix/blood-helix-first-pass.gif)

I then found the actual reference video from the site it had linked me to and handed that
over. Here's the render it produced after seeing real footage of the actual effect:

![Blood Helix, final render after reference video](/media/blood-helix/blood-helix-final-pass.gif)

And the reference clip I gave it, for context:

<video src="/media/blood-helix/blood-helix-reference-render.mp4" controls playsinline preload="metadata" width="480"></video>

## The finished product

The GIFs above are just previews — the actual datapacks are playable right now. Both
versions are included:

- [`BloodHelix-datapack-v1.zip`](/media/blood-helix/BloodHelix-datapack-v1.zip) — the
  first-pass version
- [`BloodHelix-datapack-final.zip`](/media/blood-helix/BloodHelix-datapack-final.zip) — the
  final version, corrected against the real reference footage

Drop either into a world's `datapacks` folder (or onto the Data Packs tab when creating a
new world) and it activates automatically. `/trigger bloodhelix` toggles it on and off
without needing cheats enabled.

## Why this one's going in the ledger

Both of these started from almost nothing — a misremembered username, a misremembered server
name, and a cosmetic effect described purely by its silhouette. No account IDs, no links, no
file names. It cross-referenced Mojang's servers, my own old emails, community wikis,
name-history records, and eventually a reference video I found for it — and turned all of
that into something I could actually open and use. That's the part that stuck with me.
