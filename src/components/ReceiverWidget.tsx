import { useCallback, useEffect, useRef, useState } from 'react';
import { connectSignaling, getIceServers, send, type Mode, type ServerMessage } from '../lib/signaling';
import type { Quality } from '../lib/quality';
import QualitySelect from './QualitySelect';

type Status = 'idle' | 'connecting' | 'watching' | 'ended' | 'error';

// Render's free tier spins the backend down after inactivity, so the first
// connection after a while can take 30-60s to wake it back up. Past this
// threshold we show a hint explaining the delay instead of leaving people
// wondering if it's broken.
const SLOW_CONNECTION_HINT_DELAY_MS = 4000;

export default function ReceiverWidget() {
  const [status, setStatus] = useState<Status>('idle');
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [muted, setMuted] = useState(true);
  const [quality, setQuality] = useState<Quality>('auto');
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [slowConnection, setSlowConnection] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pcReadyRef = useRef<Promise<void>>(Promise.resolve());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowConnectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSlowConnectionTimer = useCallback(() => {
    if (slowConnectionTimeoutRef.current) clearTimeout(slowConnectionTimeoutRef.current);
    slowConnectionTimeoutRef.current = null;
    setSlowConnection(false);
  }, []);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    clearSlowConnectionTimer();
  }, [clearSlowConnectionTimer]);

  useEffect(() => () => cleanup(), [cleanup]);

  // The <video> element only mounts once status flips to 'watching', which
  // happens in the same tick as ontrack — so videoRef.current is still null
  // at that point. Attach the stream here instead, once the element exists.
  useEffect(() => {
    const video = videoRef.current;
    if (status === 'watching' && video && streamRef.current) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {});
    }
  }, [status]);

  // Reflects the actual <video> playback state — pausing a live stream just
  // freezes the displayed frame locally; the underlying connection keeps running.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || status !== 'watching') return;
    const onPlay = () => setPaused(false);
    const onPause = () => setPaused(true);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [status]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);

  useEffect(() => {
    if (status !== 'watching') return;
    showControlsTemporarily();
    return () => {
      if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    };
  }, [status, showControlsTemporarily]);

  async function handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'joined': {
        clearSlowConnectionTimer();
        pcReadyRef.current = setupPeerConnection(msg.mode);
        await pcReadyRef.current;
        break;
      }
      case 'offer': {
        // The offer can arrive before setupPeerConnection finishes (it now
        // awaits a TURN-credentials fetch) — wait for the same promise so it
        // isn't dropped on a fast round-trip from the caster.
        await pcReadyRef.current;
        const pc = pcRef.current;
        const ws = wsRef.current;
        if (!pc || !ws) return;
        await pc.setRemoteDescription(msg.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send(ws, { type: 'answer', sdp: answer });
        break;
      }
      case 'ice-candidate': {
        await pcReadyRef.current;
        if (msg.candidate) {
          await pcRef.current?.addIceCandidate(msg.candidate).catch(() => {});
        }
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

  async function setupPeerConnection(mode: Mode) {
    const ws = wsRef.current;
    if (!ws) return;

    const pc = new RTCPeerConnection({ iceServers: await getIceServers(mode) });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        send(ws, { type: 'ice-candidate', candidate: event.candidate.toJSON() });
      }
    };

    pc.ontrack = (event) => {
      streamRef.current = event.streams[0];
      setStatus('watching');
    };
  }

  function changeQuality(next: Quality) {
    setQuality(next);
    if (wsRef.current) send(wsRef.current, { type: 'set-quality', quality: next });
  }

  function toggleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function togglePlayPause() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function toggleFullscreen() {
    // Fullscreen the whole player container, not just the <video> — otherwise
    // the overlay controls (siblings of the video) vanish once fullscreen.
    const player = playerRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!player) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (player.requestFullscreen) {
      player.requestFullscreen().catch(() => {});
    } else if (video?.webkitEnterFullscreen) {
      // iOS Safari only supports fullscreen on the <video> element itself,
      // so the custom overlay isn't available there — a platform limitation.
      video.webkitEnterFullscreen();
    }
  }

  function connect() {
    setErrorMessage('');
    const code = otpInput.trim();
    if (!/^\d{4}$/.test(code)) {
      setErrorMessage('Enter the 4-digit code shown on the caster’s screen.');
      setStatus('error');
      return;
    }

    setStatus('connecting');
    const ws = connectSignaling(handleServerMessage);
    wsRef.current = ws;
    slowConnectionTimeoutRef.current = setTimeout(() => setSlowConnection(true), SLOW_CONNECTION_HINT_DELAY_MS);
    ws.addEventListener('open', () => {
      send(ws, { type: 'join', otp: code });
    });
    ws.addEventListener('error', () => {
      clearSlowConnectionTimer();
      setErrorMessage('Could not reach the QuiiCast server. Please try again.');
      setStatus('error');
    });
  }

  function disconnect() {
    cleanup();
    setStatus('idle');
    setOtpInput('');
    setQuality('auto');
  }

  return (
    <div className="glass-card p-5 sm:p-8">
      {(status === 'idle' || status === 'error') && (
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </span>

          <label htmlFor="otp-input" className="mt-6 text-sm font-medium text-slate-700 dark:text-slate-300">
            Enter the 4-digit code
          </label>
          <input
            id="otp-input"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            placeholder="0000"
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-3xl font-bold
              tracking-[0.2em] text-slate-900 placeholder:text-slate-300 outline-none transition-colors
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:text-4xl sm:tracking-[0.3em]
              dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-600"
          />
          <button onClick={connect} className="btn-primary mt-5 w-full">
            Connect
          </button>
          {status === 'error' && <p className="mt-3 text-sm text-rose-400">{errorMessage}</p>}
        </div>
      )}

      {status === 'connecting' && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-400">
            {slowConnection ? 'Connecting to the server…' : 'Connecting…'}
          </p>
          {slowConnection && (
            <p className="max-w-xs text-xs text-slate-500">
              We use free server hosting — please allow a few seconds while it wakes up.
            </p>
          )}
        </div>
      )}

      {status === 'watching' && (
        <div className="flex flex-col items-center text-center">
          <div
            ref={playerRef}
            onMouseMove={showControlsTemporarily}
            onTouchStart={showControlsTemporarily}
            className={`group relative w-full overflow-hidden bg-black shadow-inner ${
              isFullscreen ? 'h-full' : 'aspect-video rounded-2xl border border-slate-200 dark:border-white/10'
            }`}
          >
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} autoPlay playsInline muted={muted} className="block h-full w-full object-contain" />

            <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>

            {paused && (
              <button
                onClick={togglePlayPause}
                aria-label="Play"
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center
                  justify-center rounded-full bg-black/50 text-white backdrop-blur transition-transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </button>
            )}

            <div
              className={`absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 pb-2 pt-8 transition-opacity duration-300 ${
                controlsVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button onClick={togglePlayPause} aria-label={paused ? 'Play' : 'Pause'} className="player-btn">
                {paused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                    <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                    <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                  </svg>
                )}
              </button>

              <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="player-btn">
                {muted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                    <path d="m17 9 4 6M21 9l-4 6" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                  </svg>
                )}
              </button>

              <span className="flex-1" />

              <QualitySelect value={quality} onChange={changeQuality} variant="overlay" />

              <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'} className="player-btn">
                {isFullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M21 16h-3a2 2 0 0 0-2 2v3M8 21v-3a2 2 0 0 0-2-2H3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button onClick={disconnect} className="btn-secondary mt-4">
            Disconnect
          </button>
        </div>
      )}

      {status === 'ended' && (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-slate-700 dark:text-slate-300">The caster ended the session.</p>
          <button onClick={() => setStatus('idle')} className="btn-primary">
            Enter a new code
          </button>
        </div>
      )}
    </div>
  );
}
