---
id: "AO-006"
title: "Claude found my old Minecraft skin and rebuilt a particle effect"
summary: "I gave Claude a vague, misspelled message about my first Minecraft account. It found the skin, worked out why I couldn't log in, and rebuilt a server effect I could only describe by its shape."
date: 2026-08-07
status: "shipped"
tags: ["claude-cowork", "minecraft", "agents", "research"]
topic: "agents"
project: ["characters"]
preview:
  verdict: "Skin recovered, worlds not"
  takeaway: "From one vague message, Claude pulled my original skin off Mojang's servers and worked out my own old account had been holding my name the whole time."
  points:
    - "The old account is almost certainly tied to an old email I can't get into."
    - "My old worlds were never stored online. They'd only survive as a backup in my own .minecraft saves folder."
    - "From 'an upside-down snowcone' it named Mineplex's Blood Helix effect and rebuilt it as a datapack you can download."
  image: "/media/previews/blood-helix-and-the-lost-skin.webp"
  loop: "/media/previews/blood-helix-and-the-lost-skin.mp4"
  alt: "The rebuilt Blood Helix effect: a ring of red particles spiralling up around the BloodTailor Minecraft skin"
---

I sent Claude a vague, typo-filled message asking for the Minecraft skin I made when the game
first came out, and it found it. It also figured out what happened to my old account. It was
still alive and holding the name BloodTailor, which is why I'd been playing as Blooedtailor, with
an extra "e", the whole time.

Then I described a cosmetic effect from an old server only by its shape, an upside-down
snowcone. Claude found out what it was called and rebuilt it as a datapack, a small Minecraft
add-on you can download below.

I did this in Claude Cowork, the mode in Claude's desktop app where it works through a task for
you and can use the accounts you connect, like your email.

- **The skin came straight off Mojang's servers.** Mojang makes Minecraft, and it still had my skin.
- **The old account is tied to an old email** I can't get into.
- **My old worlds are gone** unless I kept a backup. They were never stored online.
- **"Upside-down snowcone" was enough** to name the effect and rebuild it.

## The message I sent

This is more or less what I typed, typos and all.

> When I downloaded minecraft when it first came out. I made my own skin for it. Since then
> Minecraft has gone through tons of different updates and I ended up buying for the game
> again and creating a new account. I've never been able to figure out how to log into my
> old account because I don't even know what the account was actually for cus there are so
> many minecrafts now. I really want my old skin back, and if possible, to see my old
> worlds. Could you help me. It was when minecraft first came out and it was on windows
> desktop and I believe the username was bloodtailor.

No account ID, no email, and I wasn't even sure of the username. BloodTailor has been my
gamertag, and a character of mine, since I was fourteen. He fights Jefrie, another of my
characters, in my game [Storm Bell Fighter](/ledger/storm-bell-fighter/).

## The skin

![The recovered skin rendered front, back, and flat](/media/blood-helix/bloodtailor-skin-preview-sheet.png)

That's rendered from the actual skin file, a 64 by 64 pixel image. It's what Mojang stores and
what you load into the game.

<img src="/media/blood-helix/bloodtailor-original-skin.png" alt="The raw 64×64 BloodTailor skin texture" width="256" height="256" style="image-rendering:pixelated" />

## Why I could never log in

Every Minecraft name belongs to one account, and the name BloodTailor was taken by my own old
account. Claude got there by cross-checking Mojang's servers, my old emails and the account's
name history, the record of every name it's had.

It found a 2018 Mojang email in my inbox about an email change that never finished. So the
account almost certainly moved to a Microsoft account tied to an old email I can't get into.

My old worlds were never stored on a server. If a backup exists, it's in
`AppData\Roaming\.minecraft\saves`, the folder where Minecraft on Windows keeps its worlds.

## The effect I could only describe as an upside-down snowcone

Years ago, on a big multiplayer server, I got a cosmetic effect that spun blood-red particles
around my player like an upside-down snowcone. From the minigames I named, Master Builders and
Super Smash Mobs, Claude worked out the server was Mineplex, not Hypixel like I'd remembered.

It identified the cosmetic as Blood Helix, part of Mineplex's Vampire 2000 set. Then it went
further than I asked. It rebuilt the effect as a datapack, which needs no mods, and put it in all
three of my current worlds.

The first pass came from the wiki and my description alone. After that I found a video of the
real effect on the site it had linked me to, and handed it over.

<ao-compare cols="2" aspect="42/47">
  <figure>
    <img src="/media/blood-helix/blood-helix-first-pass.gif" alt="Blood Helix, first pass render">
    <figcaption><b>First pass</b>From the wiki and my description. Thin rings of red dots, widest at the top.</figcaption>
  </figure>
  <figure>
    <img src="/media/blood-helix/blood-helix-final-pass.gif" alt="Blood Helix, final render after reference video">
    <figcaption><b>Final</b>After it saw the real footage. A thick ring of red particles that climbs up and down the body.</figcaption>
  </figure>
</ao-compare>

Here's the reference clip I gave it.

<video src="/media/blood-helix/blood-helix-reference-render.mp4" controls playsinline preload="metadata" width="480"></video>

## Download it

- [`BloodHelix-datapack-v1.zip`](/media/blood-helix/BloodHelix-datapack-v1.zip), the first pass
- [`BloodHelix-datapack-final.zip`](/media/blood-helix/BloodHelix-datapack-final.zip), the final
  version, corrected against the real footage

Drop either one into a world's `datapacks` folder, or onto the Data Packs tab when you make a
world, and it turns on by itself. `/trigger bloodhelix` switches it on and off, even with cheats
off, the setting that normally blocks commands.
