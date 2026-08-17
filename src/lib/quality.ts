export type Quality = 'auto' | '1080p60' | '1080p30' | '720p60' | '720p30' | '480p60' | '480p30';

// `short` is used for the closed-state button in tight spaces (e.g. the
// in-player control bar) — `label` is the full text shown in the open panel.
export const QUALITY_OPTIONS: { value: Quality; label: string; short: string; recommended?: boolean }[] = [
  { value: 'auto', label: 'Auto (no cap)', short: 'Auto' },
  { value: '1080p60', label: '1080p · 60fps', short: '1080p' },
  { value: '1080p30', label: '1080p · 30fps', short: '1080p', recommended: true },
  { value: '720p60', label: '720p · 60fps', short: '720p' },
  { value: '720p30', label: '720p · 30fps', short: '720p' },
  { value: '480p60', label: '480p · 60fps', short: '480p' },
  { value: '480p30', label: '480p · 30fps', short: '480p' }
];

const RESOLUTION_PRESETS: Record<Exclude<Quality, 'auto'>, { width: number; height: number; frameRate: number }> = {
  '1080p60': { width: 1920, height: 1080, frameRate: 60 },
  '1080p30': { width: 1920, height: 1080, frameRate: 30 },
  '720p60': { width: 1280, height: 720, frameRate: 60 },
  '720p30': { width: 1280, height: 720, frameRate: 30 },
  '480p60': { width: 854, height: 480, frameRate: 60 },
  '480p30': { width: 854, height: 480, frameRate: 30 }
};

// 'auto' captures at the source's native resolution/frame rate with no cap.
// Every other preset constrains getDisplayMedia directly, so the browser
// downscales at the capture source rather than the encoder fighting to keep
// up with an uncapped feed.
export function videoConstraintsFor(quality: Quality): boolean | MediaTrackConstraints {
  if (quality === 'auto') return true;
  const preset = RESOLUTION_PRESETS[quality];
  return { width: { max: preset.width }, height: { max: preset.height }, frameRate: { max: preset.frameRate } };
}

// Applied on the caster's side in response to a receiver's quality request.
// Uses RTCRtpSender.setParameters to scale down the already-captured track
// for what's actually sent — no renegotiation, and the caster's own local
// preview (same MediaStreamTrack, not the RTP-encoded copy) stays full quality.
export async function applyQualityToSender(sender: RTCRtpSender, quality: Quality): Promise<void> {
  const track = sender.track;
  if (!track) return;

  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];

  if (quality === 'auto') {
    delete params.encodings[0].scaleResolutionDownBy;
    delete params.encodings[0].maxFramerate;
  } else {
    const settings = track.getSettings();
    const nativeWidth = settings.width ?? 1920;
    const nativeHeight = settings.height ?? 1080;
    const preset = RESOLUTION_PRESETS[quality];
    const scale = Math.max(1, nativeWidth / preset.width, nativeHeight / preset.height);
    params.encodings[0].scaleResolutionDownBy = scale;
    params.encodings[0].maxFramerate = preset.frameRate;
  }

  await sender.setParameters(params).catch(() => {});
}
