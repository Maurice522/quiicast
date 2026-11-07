---
title: "How to Screen Cast to Roku: What Works on Windows, Android, iPhone and Mac"
description: "Roku has no web browser, so browser-based tools can't land on it. Here's what does work, device by device, and the Roku settings to check first."
seoTitle: "How to Screen Cast to Roku: What Works & What Doesn't"
seoDescription: "Screen cast to a Roku from Windows, Android, iPhone or Mac: Miracast, AirPlay and casting apps explained, plus the one thing Roku can't do."
publishDate: 2026-11-07
image: "/blog/how-to-screen-cast-to-roku.svg"
imageAlt: "Two connected screens with a remote control icon representing casting to a Roku device"
tags: ["home", "TV", "Roku"]
---

**Short answer:** you can mirror a Windows PC or an Android phone to a Roku with Miracast, mirror an iPhone, iPad or Mac to some newer Roku models with AirPlay, and send individual videos or photos from a phone with Roku's own casting features. What you can't do is open a website on a Roku, because Roku's operating system has no general-purpose web browser. That last point rules out every browser-based screen-sharing tool, ours included.

## First, check these Roku settings

Most "my screen won't cast" problems on Roku are settings, not network faults.

1. On the Roku, go to **Settings > System > Screen mirroring** and look at *Screen mirroring mode*. **Prompt** asks you to approve each connection; **Always allow** skips the prompt; **Never allow** blocks mirroring entirely.
2. Put the Roku and the sending device on the same WiFi network. Guest networks and some mesh setups isolate devices from each other, which breaks discovery.
3. If you plan to use AirPlay, look under **Settings > Apple AirPlay and HomeKit**. Only some Roku TVs and players have this menu, so its absence is your answer for that device.

## Pick your source device

### Windows PC

Windows talks to Roku over Miracast. Press **Windows key + K** (or open the Action Center and choose **Cast**), pick your Roku from the list, and approve the prompt on the TV if mirroring mode is set to Prompt. If the Roku doesn't appear, the PC's WiFi adapter or driver may not support Miracast; updating the wireless driver is the usual fix.

### Android phone or tablet

Look for **Smart View**, **Cast** or **Screen Mirroring** in the quick-settings panel; the name varies by manufacturer. Pick the Roku and approve the prompt. Because Android's mirroring support is manufacturer-specific, a few phones lack it, in which case the Roku mobile app's *Play on Roku* feature (below) is the fallback.

### iPhone or iPad

iPhones don't use Miracast. If your Roku model supports AirPlay, open Control Center, tap **Screen Mirroring**, and choose the Roku. If it isn't listed, your model likely doesn't support AirPlay, and the realistic options are the casting apps below or a cable adapter to the TV's HDMI port.

### Mac

Same as iPhone: use the **Screen Mirroring** item in the menu bar and choose a Roku that supports AirPlay. Macs can't use Miracast.

## Mirroring versus casting a single video

Mirroring copies your whole screen, with everything that implies for lag and privacy. Casting hands one video to the Roku to play itself, which usually looks better and keeps your phone free. Netflix, YouTube and many other apps show a cast icon that targets Roku directly, and the Roku mobile app's **Play on Roku** option sends photos, videos and music from your phone. If all you want is to watch something on the big screen, casting from the app beats mirroring almost every time.

## Why a browser can't help here

Roku's interface is built entirely from installed channels. There's no address bar, no hidden browser, and no way to sideload one on stock hardware. A tool like [QuiiCast](/receiver) needs a browser on the receiving device to load its receive page, so it can't reach a Roku screen. That holds across the whole lineup, from the cheapest streaming stick to Roku-branded TVs.

## Where a browser-based share still helps

If the real goal is "get my screen in front of someone," and the Roku was only the assumed route, any device with a browser can receive a share: a tablet, a second laptop, or a smart TV that isn't Roku-based. The [TV guide](/blog/screen-share-to-a-tv) covers which TVs include a usable browser. If you have one of those nearby, [start a share](/caster) and open the receive page there.

## Quick troubleshooting

- **Roku not listed in Windows or Android:** confirm the same network, toggle the Roku's screen mirroring mode to *Always allow* to rule out a missed prompt, and restart the Roku.
- **Choppy picture:** Miracast runs over WiFi Direct and suffers in crowded 2.4 GHz environments. Move closer to the router or switch the PC to 5 GHz.
- **Audio plays on the PC, not the TV:** in Windows, check the sound output device while the cast is active.
