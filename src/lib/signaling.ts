import type { Quality } from './quality';

export type Mode = 'internet' | 'lan';

// The caster juggles one RTCPeerConnection per receiver, so messages routed
// to it are tagged with which receiver they belong to. A receiver only ever
// has a single connection (to the caster), so the server strips the tag
// before forwarding — receiverId is absent on that side.
export type ServerMessage =
  | { type: 'otp-created'; otp: string; expiresInMinutes: number; mode: Mode; maxReceivers: number }
  | { type: 'joined'; mode: Mode }
  | { type: 'receiver-joined'; receiverId: string }
  | { type: 'receiver-left'; receiverId: string }
  | { type: 'offer'; receiverId?: string; sdp: RTCSessionDescriptionInit }
  | { type: 'answer'; receiverId?: string; sdp: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; receiverId?: string; candidate: RTCIceCandidateInit }
  | { type: 'set-quality'; receiverId?: string; quality: Quality }
  | { type: 'peer-left' }
  | { type: 'error'; message: string };

export function getWsUrl(): string {
  const url = import.meta.env.PUBLIC_WS_URL;
  if (!url) throw new Error('PUBLIC_WS_URL is not set — check your .env file.');
  return url;
}

// In LAN mode we deliberately omit STUN servers so ICE gathering only
// produces host (local network) candidates — media never leaves the LAN.
// Signaling still needs the internet-reachable backend either way.
export function iceServersFor(mode: Mode): RTCIceServer[] {
  return mode === 'lan' ? [] : [{ urls: 'stun:stun.l.google.com:19302' }];
}

export function connectSignaling(onMessage: (msg: ServerMessage) => void): WebSocket {
  const ws = new WebSocket(getWsUrl());
  ws.addEventListener('message', (event) => {
    try {
      onMessage(JSON.parse(event.data));
    } catch {
      // Ignore malformed messages.
    }
  });
  return ws;
}

export function send(ws: WebSocket, message: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}
