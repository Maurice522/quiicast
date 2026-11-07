---
title: "How to Screen Share on iPhone: Four Ways That Work, and One That Doesn't"
description: "An iPhone can receive a browser-based screen share but can't send one. Here's how to share your iPhone screen anyway, with FaceTime, Zoom, a Mac or AirPlay."
seoTitle: "How to Screen Share on iPhone: What Works in 2026"
seoDescription: "Share your iPhone screen with FaceTime, a call app's broadcast option, AirPlay or a Mac, and why websites can't screen share from iPhone."
publishDate: 2026-11-07
image: "/blog/watching-media-together-remotely.svg"
imageAlt: "Two connected screens with a play button representing viewing a shared screen on an iPhone"
tags: ["mobile", "iPhone"]
---

Two different questions hide inside "how do I screen share on iPhone," and the answers are opposite. **Watching** someone else's shared screen on an iPhone is easy and works in Safari. **Sending** your iPhone's screen to someone else is the hard direction, and a website can't do it for you.

## Why websites can't share an iPhone screen

Browser-based screen sharing relies on a web API called `getDisplayMedia`. Apple doesn't make it available to websites on iOS, and every iPhone browser, Chrome and Firefox included, is built on Apple's WebKit engine and inherits that limit. So no web tool can capture your iPhone's screen, however well it's built. Apps can, because iOS gives installed apps a separate broadcast mechanism that websites can't use.

## Four ways to share your iPhone's screen

### 1. FaceTime's Share My Screen

On a FaceTime call, tap the screen-share button (the rectangle with a person) and choose **Share My Screen**. It works between Apple devices on iOS 15.1 and later. It's the simplest option when everyone has an iPhone, iPad or Mac, and useless if the other person is on Android or Windows.

### 2. The broadcast option in a call app

Zoom, Microsoft Teams, Google Meet, Discord and similar apps can broadcast your iPhone screen into a call. In the app, choose to share your screen, then pick the app from the **Broadcast** sheet that iOS shows and start the broadcast. You'll see the usual red recording indicator in the status bar. This works with non-Apple participants, at the cost of everyone being in that app.

### 3. AirPlay to a Mac, Apple TV or compatible TV

Open Control Center, tap **Screen Mirroring**, and pick the destination. Newer Macs can act as AirPlay receivers, which turns a Mac into a way to put your iPhone on a larger screen or into a recording or a conference call.

### 4. Plug into a Mac with QuickTime

Connect the iPhone to a Mac by cable, open QuickTime Player, choose **File > New Movie Recording**, and select the iPhone as the camera source. Your iPhone screen appears live in a Mac window, and from there you can share that window through any tool, including a browser-based one.

## The browser-based route: use the iPhone as the viewer

The half of the problem a website can solve is the receiving side. If someone shares their screen from a desktop or an Android device, an iPhone can open [quiicast.com/receiver](/receiver) in Safari, type the code and watch, with nothing to install. Watching works on iOS because playing a video stream doesn't need the capture API.

![The receive page as it appears in a browser, ready for a code](/blog/screenshot-receiver-idle.png)

![The sender's side: a code to give the viewer](/blog/screenshot-caster-sharing.png)

You can combine the two. Use method 4 to mirror an iPhone into a Mac window, then [share that window](/caster) so a colleague on any device can watch. It's more steps than FaceTime, but it reaches people who have no Apple device and no call app.

## Which should you use?

- **Everyone has Apple devices:** FaceTime.
- **You're already on a Zoom, Teams or Meet call:** that app's broadcast option.
- **Presenting to a room:** AirPlay to an Apple TV or compatible TV.
- **Sharing with someone on any device, no app for them:** QuickTime mirroring plus a browser-based share.

## Common problems

- **No Broadcast option in the app:** update the app, since broadcast support depends on the app version, and make sure Screen Recording isn't restricted under Settings > Screen Time.
- **AirPlay target missing:** both devices need to be on the same WiFi network, and Bluetooth should be on.
- **Notifications showing up on the shared screen:** turn on Do Not Disturb or a Focus mode before you start; mirroring shows everything.
