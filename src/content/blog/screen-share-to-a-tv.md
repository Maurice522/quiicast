---
title: "Screen Sharing to a TV: Same-WiFi Casting, the Roku Exception, and Watching Together Remotely"
description: "Getting a laptop screen onto a bigger display, the honest reason Roku can't do it directly, and watching something with someone who isn't in the room — including when AirPlay or Chromecast is just the better choice."
publishDate: 2026-09-25
updatedDate: 2026-09-26
image: "/blog/casting-to-a-tv-on-same-wifi.svg"
imageAlt: "Two connected screens with a television icon representing casting to a TV"
tags: ["home", "TV", "LAN mode"]
---

Getting a laptop screen onto a bigger display shouldn't require finding the right cable or fighting with a smart TV's own casting app — but it also isn't always possible, depending on what's actually running the TV. This covers three related cases: casting to a TV in the same room, the specific reason Roku can't receive a browser-based share, and watching something with someone who's nowhere near you at all.

## Casting from a laptop to a TV on the same WiFi

If the TV has its own web browser, this works the same way as sharing to any other device: open [quiicast.com/receiver](/receiver) on the TV, and type in the code shown on your laptop after starting a share from [quiicast.com/caster](/caster). Since you're in the same room, turn on **Prefer local WiFi** first — it keeps the video on your home network instead of routing it over the internet, which usually means lower latency. The two devices still need a brief moment of internet access to find each other; only the actual video traffic stays local.

![The receive page open and ready for a code — this is what to load on the TV's browser](/blog/screenshot-receiver-idle.png)

Whether this works at all depends entirely on the TV having a real browser:

- **Android TV / Google TV** (Sony, TCL, Hisense, some Philips) ships with a Chrome-based browser, or one is installable from the Play Store.
- **LG webOS** and **Samsung Tizen** TVs both include a browser, usually tucked under a "Web Browser" app rather than on the home screen.
- **Fire TV** has Silk Browser available, but it isn't preinstalled on every model.
- **Older "smart" TVs** from the early 2010s often technically have a browser too outdated to render a modern page reliably.
- **Roku** — no general-purpose browser at all, covered in detail below.

## The Roku exception

If you're specifically searching for how to screen cast to Roku, here's the honest answer up front: you can't open a receive page directly on one, because Roku's operating system doesn't include a general-purpose web browser. This applies across the whole lineup — the cheapest Express stick, the higher-end Ultra, and Roku-branded TVs from TCL, Hisense, and others all share the same core OS and the same limitation. There's no address bar, no hidden developer mode, and no way to navigate to any website on stock Roku hardware. Any screen-sharing tool that depends on a receiving browser — QuiiCast included — hits the same wall.

Roku does have its own answer to "get my laptop on the TV," just not through a browser: **screen mirroring**, based on Miracast, which lets some Windows and Android devices mirror their display to a Roku over WiFi directly. It's a different technology entirely — no browser, no code, an OS-level mirroring protocol instead. Miracast isn't supported on iPhone or iPad at all, since Apple uses AirPlay instead, which most Roku devices don't support (a handful of newer Roku models have added limited AirPlay compatibility — check your specific model). To try Miracast from Windows: open the **Action Center** (or press Windows key + K), select **Cast**, and choose your Roku from the list.

If the real goal is "my laptop screen, on the TV connected to my Roku," the reliable fallbacks are:

- **An HDMI cable**, which bypasses Roku's OS entirely — the TV just displays whatever the laptop sends.
- **Miracast**, for Windows or Android sources, as above.
- **A different receiving screen** — a tablet, a second laptop, a phone — where [QuiiCast works normally](/receiver), Roku or not.
- **A smart TV with its own browser**, per the compatibility notes above.

## Watching something together when you're not in the same room

![The TV connected and receiving the live feed](/blog/screenshot-receiver-watching.png)

The other direction — sharing to someone who isn't physically near you at all — comes up constantly: a video too good to describe, a photo album from a trip, a browser tab with a listing you found. Sending a link works, but it strips out reacting together in real time. Whatever's on your screen, share it from [quiicast.com/caster](/caster) and send the code; the other person watches on [quiicast.com/receiver](/receiver) from their laptop, tablet, or phone, while you talk over a separate phone or video call. It's genuinely one-way — there's no synced playback control on their end, so it works best with a little narration ("okay, pausing here"). If either of you is on mobile data, dropping the quality preset a notch keeps things smooth without burning through a data plan.

## When AirPlay, Chromecast, or Miracast is just the better choice

If your devices already support native casting and it's already set up, use it — it's typically lower-latency and doesn't need a browser open on the receiving end at all. QuiiCast is the fallback for when native casting isn't an option: mismatched ecosystems (an Android phone and an Apple TV), casting disabled on a shared network, or simply not wanting to deal with pairing for a one-off. It's also the only option of the three that works for showing someone a screen from across the internet, not just across a room.

## FAQ

**Will there be lag casting to a TV?** On the same WiFi with "Prefer local WiFi" on, latency is typically low enough to stay in sync with narration. A congested home network can still add delay.

**Does audio come through the TV speakers?** Yes, if you choose to share audio in your browser's picker — it plays through whatever device is receiving the stream.

**Will Roku ever add browser support?** There's no indication of it — Roku's whole design is a locked-down, channel-based interface, which is part of why it stays simple and cheap.

Full connection setup — starting a cast, sharing the code, quality settings — is on the [how it works](/how-it-works) page.
