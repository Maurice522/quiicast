export interface Faq {
  question: string;
  answer: string;
}

// Single source of truth, shared by the /faq page (visible accordion + JSON-LD
// FAQPage schema) and the homepage's condensed FAQ section, so all three stay
// in sync automatically instead of risking three copies drifting apart.
export const faqs: Faq[] = [
  {
    question: 'How do I screen share?',
    answer:
      "Open the QuiiCast cast page, click Start sharing, and pick the screen, window, or tab you want to share. QuiiCast gives you a 4-digit code — send it to whoever you want to share with, and they enter it on the receive page to watch instantly. No account or download is required on either side."
  },
  {
    question: 'How do I screen share on iPhone?',
    answer:
      "You can receive a screen share on an iPhone in Safari — just open the QuiiCast receive page and enter the code. Casting from an iPhone is different: Apple's iOS restricts Safari from capturing the screen, so a browser-based tool like QuiiCast can't share out from an iPhone. Native apps like Zoom or FaceTime can do this because they use Apple's own screen-broadcast APIs, which aren't available to websites."
  },
  {
    question: 'How do I cast my screen to a TV?',
    answer:
      'If your TV has its own web browser (most modern smart TVs do), open the QuiiCast receive page on the TV and enter the code shown on your laptop after you start sharing. Turning on "Prefer local WiFi" keeps the video on your home network for lower latency when both devices are in the same room.'
  },
  {
    question: 'How do I screen share to a Roku TV?',
    answer:
      "You can't open a browser-based tool like QuiiCast directly on a Roku, because Roku's operating system doesn't include a general-purpose web browser — it's built around installed channels, not arbitrary websites. To get a laptop screen onto a Roku-connected TV, connect it directly with an HDMI cable, or cast to a different device (like a tablet or phone) that does have a browser instead."
  },
  {
    question: 'How do I share my screen on a TV using Realme?',
    answer:
      "Most Realme TVs run Android TV or Google TV, which support installing a browser app from the Google Play Store if one isn't already on the TV. Once a browser is available, open the QuiiCast receive page on it and enter the code — the same way you would on any other smart TV with browser support."
  },
  {
    question: 'Can you screen share on FaceTime?',
    answer:
      "Yes — since iOS 15, FaceTime supports screen sharing through SharePlay's Share My Screen feature, available on iPhone, iPad, and Mac. It only works between Apple devices on a FaceTime call, though. QuiiCast is built for the opposite case: sharing your screen with anyone on any device, without needing FaceTime, an Apple ID, or even a call set up first."
  },
  {
    question: 'How do I share my screen on Zoom?',
    answer:
      'Zoom has its own built-in Share Screen button in the meeting toolbar. QuiiCast is a separate, lighter tool for when you want to share your screen without opening Zoom at all — no meeting to schedule, no account, just a 4-digit code.'
  },
  {
    question: 'How do I share my screen on Microsoft Teams?',
    answer:
      'Teams has a native Share button inside any call or meeting. If you just need to show someone your screen without setting up a Teams call, QuiiCast works the same way for any device with a browser — start sharing and send the code.'
  },
  {
    question: 'How do I share my screen on Google Meet?',
    answer:
      "Google Meet has a Present now option built into every meeting. QuiiCast is useful when you don't want to create a Meet link at all — just a browser tab and a 4-digit code, with nothing to schedule."
  },
  {
    question: 'How do I share my screen on Discord?',
    answer:
      "Discord has a built-in Screen Share button available in voice channels. QuiiCast is a good alternative when you want to share your screen with someone who isn't in your Discord server, or when you'd rather not deal with a Discord account at all."
  },
  {
    question: 'How do I screen share Netflix on Discord?',
    answer:
      "In most cases, you can't — Netflix and other streaming services use DRM copy protection that deliberately blocks screen capture, so the shared video shows up black regardless of what tool you're using. This isn't a Discord-specific bug; it happens with QuiiCast and every other screen-sharing tool too, because the restriction is enforced by the browser and operating system, not the app doing the sharing."
  }
];
