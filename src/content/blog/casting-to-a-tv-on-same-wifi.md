---
title: "Casting Your Laptop to a TV on the Same WiFi"
description: "Getting your laptop screen onto a bigger display in the same room without a cable or a smart-TV app."
publishDate: 2026-08-07
image: "/blog/casting-to-a-tv-on-same-wifi.svg"
imageAlt: "Two connected screens with a television icon representing casting to a TV"
tags: ["home", "LAN mode"]
---

Getting a laptop screen onto a bigger display in the same room shouldn't require finding the right cable or fighting with a smart TV's built-in casting app — especially if all you actually need is a browser open on the TV's side.

## Same room, still more friction than it should be

If your laptop and TV don't speak the same casting protocol, or the TV's browser is slow and clunky, "just cast it" turns into ten minutes of troubleshooting. Meanwhile, both devices are sitting three feet apart on the same WiFi network. HDMI cables get left at the office, adapters go missing, and half the "smart" casting standards only talk to devices from the same manufacturer.

## Which TVs can actually do this

This approach only works if the TV itself can open a web page, so it's worth knowing which ones qualify before you try:

- **Android TV / Google TV** (Sony, TCL, Hisense, some Philips models) — ships with a Chrome-based browser, or one is installable from the Play Store. Works well.
- **LG webOS** and **Samsung Tizen** smart TVs both include a built-in browser under a "Web Browser" app, usually tucked away in the apps menu rather than on the home screen.
- **Roku TVs and Roku streaming sticks** — no general-purpose browser at all. See [how to screen cast to Roku](/blog/how-to-screen-cast-to-roku) for what to do instead.
- **Fire TV** — Silk Browser is available but not preinstalled on every model; check the Appstore first.
- **Older "smart" TVs** from the early 2010s often technically have a browser, but it's frequently too outdated to render a modern page correctly — worth testing before you rely on it for something important.

## Setting it up

1. On your laptop, turn on **Prefer local WiFi** in the caster settings *before* you click "Start sharing" — this keeps the video on your home network instead of routing it through the internet.
2. Click **Start sharing my screen** and pick the window, tab, or entire screen you want the TV to show.
3. On the TV's browser, go to [quiicast.com/receiver](/receiver) and type in the 4-digit code shown on your laptop.
4. Use the TV remote's on-screen keyboard to enter the code — slower than typing on a laptop, but it only takes a few seconds.

It's worth being upfront about what "Prefer local WiFi" does and doesn't do: the *video* stays on your LAN, but the two devices still need a brief moment of internet access to find each other through signaling — it's not a fully offline connection, just one where the heavy traffic (the video itself) never leaves your network.

## Good uses around the house

- Pulling up a browser-based photo album or slideshow on the TV for people in the room
- Sharing your screen for a game, a spreadsheet, or a recipe video without AirPlay/Chromecast set up
- A quick way to show something on the big screen when the TV's own browser is too limited to load the page well itself
- Mirroring a video call or presentation for a small watch party without a laptop stand blocking the view

For everyday streaming, your TV's native apps are still the better choice — this is for the moments where you want *your* laptop screen, specifically, on the bigger display.

## FAQ

**Why not just use AirPlay or Chromecast instead?**
Those work great when they're already set up and your devices support them. This is the fallback for when they aren't — a different brand of TV than your laptop expects, a TV with casting disabled on a shared network, or simply not wanting to deal with pairing.

**Will there be lag?**
On the same WiFi network with "Prefer local WiFi" enabled, latency is typically low enough that video and any narration you're doing stay in sync. A busy, congested home network (lots of other devices streaming at once) can still introduce some delay.

**Does audio come through the TV speakers?**
Yes — when you choose to share audio in your browser's screen-share picker, it's included in the stream and plays through whatever device is receiving it, including the TV.

One common question worth addressing directly: this only works if your TV has its own browser. If your TV runs on Roku, [it doesn't](/blog/how-to-screen-cast-to-roku) — Roku's OS has no general-purpose browser, so a Roku-connected TV needs a different approach entirely.
