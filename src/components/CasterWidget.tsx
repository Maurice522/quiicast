import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSignaling, getIceServers, send, type Mode, type ServerMessage } from '../lib/signaling';
import { applyQualityToSender, videoConstraintsFor, type Quality } from '../lib/quality';
import QualitySelect from './QualitySelect';

type Status = 'idle' | 'starting' | 'waiting' | 'connected' | 'ended' | 'error';

// Render's free tier spins the backend down after inactivity, so the first
// connection after a while can take 30-60s to wake it back up. Past this
// threshold we show a hint explaining the delay instead of leaving people
// wondering if it's broken.
const SLOW_CONNECTION_HINT_DELAY_MS = 4000;

interface PeerEntry {
  pc: RTCPeerConnection;
  videoSender: RTCRtpSender | null;
}

// Prefer H.264 for the video codec — it's more likely than VP8/VP9/AV1 to hit
// hardware encode/decode on the sender and receiver, which helps at high
// resolutions where a software encoder can become the bottleneck. This is a
// codec choice, not a resolution/bitrate cap — quality is unaffected.
function preferH264(transceiver: RTCRtpTransceiver) {
  const capabilities = RTCRtpSender.getCapabilities('video');
  if (!capabilities) return;
  const h264 = capabilities.codecs.filter((c) => c.mimeType.toLowerCase() === 'video/h264');
  const rest = capabilities.codecs.filter((c) => c.mimeType.toLowerCase() !== 'video/h264');
  if (h264.length === 0) return;
  transceiver.setCodecPreferences([...h264, ...rest]);
}

export default function CasterWidget() {
  const [status, setStatus] = useState<Status>('idle');
  const [mode, setMode] = useState<Mode>('internet');
  const [quality, setQuality] = useState<Quality>('auto');
  const [otp, setOtp] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const [maxReceivers, setMaxReceivers] = useState(5);
  const [receiverCount, setReceiverCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  // A caster can have several simultaneous receivers, each its own peer
  // connection (mesh, not an SFU) — keyed by the receiverId the server assigns.
  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const streamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowConnectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSlowConnectionTimer = useCallback(() => {
    if (slowConnectionTimeoutRef.current) clearTimeout(slowConnectionTimeoutRef.current);
    slowConnectionTimeoutRef.current = null;
    setSlowConnection(false);
  }, []);

  const cleanup = useCallback(() => {
    for (const { pc } of peersRef.current.values()) pc.close();
    peersRef.current.clear();
    setReceiverCount(0);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = null;
    clearSlowConnectionTimer();
  }, [clearSlowConnectionTimer]);

  useEffect(() => () => cleanup(), [cleanup]);

  // The self-preview <video> only mounts once status is 'waiting'/'connected',
  // which happens after an async round-trip to the server — well after the
  // stream itself was captured. Attach it here once the element exists.
  useEffect(() => {
    const video = localVideoRef.current;
    if ((status === 'waiting' || status === 'connected') && video && streamRef.current) {
      if (video.srcObject !== streamRef.current) video.srcObject = streamRef.current;
      video.play().catch(() => {});
    }
  }, [status]);

  async function handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'otp-created': {
        // Also fires on an auto-refresh after expiry — don't clobber
        // 'connected' if receivers are already on this session.
        clearSlowConnectionTimer();
        setOtp(msg.otp);
        setExpiresInMinutes(msg.expiresInMinutes);
        setMaxReceivers(msg.maxReceivers);
        setStatus(peersRef.current.size > 0 ? 'connected' : 'waiting');

        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = setTimeout(() => {
          if (wsRef.current) send(wsRef.current, { type: 'refresh-otp' });
        }, msg.expiresInMinutes * 60 * 1000);
        break;
      }
      case 'receiver-joined': {
        await createOfferFor(msg.receiverId);
        setReceiverCount(peersRef.current.size);
        setStatus('connected');
        break;
      }
      case 'receiver-left': {
        const entry = msg.receiverId ? peersRef.current.get(msg.receiverId) : undefined;
        entry?.pc.close();
        if (msg.receiverId) peersRef.current.delete(msg.receiverId);
        const count = peersRef.current.size;
        setReceiverCount(count);
        setStatus(count > 0 ? 'connected' : 'waiting');
        break;
      }
      case 'answer': {
        const entry = msg.receiverId ? peersRef.current.get(msg.receiverId) : undefined;
        await entry?.pc.setRemoteDescription(msg.sdp);
        break;
      }
      case 'ice-candidate': {
        const entry = msg.receiverId ? peersRef.current.get(msg.receiverId) : undefined;
        if (msg.candidate) await entry?.pc.addIceCandidate(msg.candidate).catch(() => {});
        break;
      }
      case 'set-quality': {
        const entry = msg.receiverId ? peersRef.current.get(msg.receiverId) : undefined;
        if (entry?.videoSender) await applyQualityToSender(entry.videoSender, msg.quality);
        break;
      }
      case 'peer-left': {
        setStatus('ended');
        cleanup();
        break;
      }
      case 'error': {
        setErrorMessage(msg.message);
        setStatus('error');
        cleanup();
        break;
      }
    }
  }

  async function createOfferFor(receiverId: string) {
    const ws = wsRef.current;
    const stream = streamRef.current;
    if (!ws || !stream) return;

    const pc = new RTCPeerConnection({ iceServers: await getIceServers(mode) });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const videoTransceiver = pc.getTransceivers().find((t) => t.sender.track?.kind === 'video');
    if (videoTransceiver) preferH264(videoTransceiver);

    peersRef.current.set(receiverId, { pc, videoSender: videoTransceiver?.sender ?? null });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send(ws, { type: 'ice-candidate', receiverId, candidate: event.candidate.toJSON() });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    send(ws, { type: 'offer', receiverId, sdp: offer });
  }

  async function startSharing() {
    setErrorMessage('');
    setStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: videoConstraintsFor(quality),
        audio: true,
        // Chrome switches the visible tab to whatever the user picks in the
        // share dialog by default — this opts out, so casting doesn't yank
        // the caster away from this page.
        surfaceSwitching: 'exclude'
      } as DisplayMediaStreamOptions);
      streamRef.current = stream;

      // If the user stops sharing via the browser's native control, tear everything down.
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setStatus('ended');
        cleanup();
      });

      const ws = connectSignaling(handleServerMessage);
      wsRef.current = ws;
      slowConnectionTimeoutRef.current = setTimeout(() => setSlowConnection(true), SLOW_CONNECTION_HINT_DELAY_MS);
      ws.addEventListener('open', () => {
        send(ws, { type: 'start-cast', mode });
      });
      ws.addEventListener('error', () => {
        clearSlowConnectionTimer();
        setErrorMessage('Could not reach the QuiiCast server. Please try again.');
        setStatus('error');
      });
    } catch {
      setErrorMessage('Screen share permission was denied or cancelled.');
      setStatus('idle');
    }
  }

  function stopSharing() {
    if (wsRef.current) send(wsRef.current, { type: 'stop-cast' });
    cleanup();
    setStatus('idle');
    setOtp('');
  }

  function copyOtp() {
    navigator.clipboard.writeText(otp).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="glass-card p-5 sm:p-8">
      {status === 'idle' && (
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </span>

          <div className="mt-6 flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/5">
            <span className="text-left text-sm text-slate-700 dark:text-slate-300">
              Prefer local WiFi
              <span className="mt-0.5 block text-xs text-slate-500">Faster on local network — still needs internet to connect</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={mode === 'lan'}
              onClick={() => setMode(mode === 'lan' ? 'internet' : 'lan')}
              className={`flex h-6 w-11 shrink-0 items-center self-end rounded-full p-0.5 transition-colors duration-200 sm:self-auto ${
                mode === 'lan' ? 'justify-end bg-brand-500' : 'justify-start bg-slate-300 dark:bg-white/15'
              }`}
            >
              <span className="h-5 w-5 rounded-full bg-white shadow" />
            </button>
          </div>

          <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <span className="text-left text-sm text-slate-700 dark:text-slate-300">Quality</span>
            <QualitySelect value={quality} onChange={setQuality} />
          </div>

          <button onClick={startSharing} className="btn-primary mt-6 w-full">
            Start sharing my screen
          </button>
          {errorMessage && <p className="mt-3 text-sm text-rose-400">{errorMessage}</p>}
        </div>
      )}

      {status === 'starting' && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-400">
            {slowConnection ? 'Connecting to the server…' : 'Waiting for screen share permission…'}
          </p>
          {slowConnection && (
            <p className="max-w-xs text-xs text-slate-500">
              We use free server hosting — please allow a few seconds while it wakes up.
            </p>
          )}
        </div>
      )}

      {(status === 'waiting' || status === 'connected') && (
        <div className="flex flex-col items-center text-center">
          <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-inner dark:border-white/10">
            <video ref={localVideoRef} autoPlay playsInline muted className="aspect-video w-full object-contain" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              You're sharing this
            </span>
          </div>

          <p className="mt-6 text-xs font-medium uppercase tracking-wider text-slate-500">Share this code</p>
          <div className="mt-1 flex items-center gap-1">
            <button
              onClick={copyOtp}
              title="Click to copy"
              className="rounded-2xl px-4 py-2 text-4xl font-bold tracking-[0.2em] text-slate-900 transition-colors hover:bg-slate-100 sm:text-5xl sm:tracking-[0.25em] dark:text-white dark:hover:bg-white/5"
            >
              {otp}
            </button>
            <button onClick={copyOtp} aria-label="Copy code" title="Copy code" className="icon-btn">
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-emerald-500">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <rect x="8" y="2" width="8" height="4" rx="1" />
                  <path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {copied ? 'Copied!' : `Expires in ${expiresInMinutes} min · up to ${maxReceivers} viewers`}
          </p>

          <span
            className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              status === 'waiting'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${status === 'waiting' ? 'bg-amber-400 animate-pulse-ring' : 'bg-emerald-400'}`} />
            {status === 'waiting'
              ? 'Waiting for someone to connect…'
              : `${receiverCount} viewer${receiverCount === 1 ? '' : 's'} connected`}
          </span>

          <button onClick={stopSharing} className="btn-secondary mt-6">
            Stop sharing
          </button>
        </div>
      )}

      {status === 'ended' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">The session ended.</p>
          <button onClick={() => setStatus('idle')} className="btn-primary">
            Start a new session
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-rose-400">{errorMessage}</p>
          <button onClick={() => setStatus('idle')} className="btn-primary">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
