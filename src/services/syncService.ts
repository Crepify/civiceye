/**
 * Photo sync service powering the "scan QR on your phone, photo lands on
 * your desktop" flow.
 *
 * Prototype strategy:
 *  - Same-browser (desktop + phone tab on one machine): BroadcastChannel
 *    delivers the photo instantly.
 *  - Cross-device: the phone publishes into the shared origin's storage
 *    and the desktop polls it; because real devices don't share storage,
 *    we also simulate a "CivicEye cloud" relay with an artificial delay
 *    so the UX is identical to a production backend.
 */

import { uid } from '@/utils/cn';

const CHANNEL_NAME = 'civiceye-photo-sync';
const STORAGE_PREFIX = 'civiceye:sync:';
const CLOUD_PREFIX = 'civiceye:cloud:';

export interface SyncPayload {
  sessionId: string;
  photo: string; // data URL
  capturedAt: string;
}

export interface SyncEvent extends SyncPayload {
  /** How the event arrived — useful for the demo UI. */
  via: 'channel' | 'poll' | 'cloud';
}

type Listener = (event: SyncEvent) => void;

const listeners = new Set<Listener>();
let channel: BroadcastChannel | null = null;
let polling = false;

/** Start a new sync session on the desktop side. */
export function createSyncSession(): string {
  return uid('sync');
}

function broadcast(payload: SyncPayload): void {
  if (channel) channel.postMessage(payload);
}

/** Read events destined for a session from local storage (shared origin). */
function readStored(sessionId: string): SyncEvent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + sessionId);
    if (!raw) return null;
    const payload = JSON.parse(raw) as SyncPayload;
    return { ...payload, via: 'poll' };
  } catch {
    return null;
  }
}

/** Simulated cloud relay — persists to storage under a separate key. */
function readCloud(sessionId: string): SyncEvent | null {
  try {
    const raw = window.localStorage.getItem(CLOUD_PREFIX + sessionId);
    if (!raw) return null;
    const payload = JSON.parse(raw) as SyncPayload;
    return { ...payload, via: 'cloud' };
  } catch {
    return null;
  }
}

function notify(event: SyncEvent): void {
  listeners.forEach((l) => l(event));
}

/**
 * Desktop: subscribe to photos arriving for `sessionId`.
 * Returns an unsubscribe function.
 */
export function subscribeToSession(sessionId: string, listener: Listener): () => void {
  listeners.add(listener);

  if (!channel && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (e: MessageEvent<SyncPayload>) => {
      if (e.data?.sessionId === sessionId) notify({ ...e.data, via: 'channel' });
    };
  }

  if (!polling) {
    polling = true;
    const seen = new Set<string>();
    // Poll local storage every 1.2s (covers the shared-origin tab case)
    // and the simulated cloud every 2s (simulated cross-device).
    window.setInterval(() => {
      const fromStorage = readStored(sessionId);
      if (fromStorage && !seen.has(fromStorage.capturedAt)) {
        seen.add(fromStorage.capturedAt);
        notify(fromStorage);
      }
      const fromCloud = readCloud(sessionId);
      if (fromCloud && !seen.has(fromCloud.capturedAt)) {
        seen.add(fromCloud.capturedAt);
        notify(fromCloud);
      }
    }, 1200);
  }

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Phone: publish a captured photo into the sync session.
 * Writes to shared storage (instant on same device) and to the simulated
 * cloud with a short delay (simulated cross-device relay).
 */
export function publishPhoto(sessionId: string, photo: string): void {
  const payload: SyncPayload = {
    sessionId,
    photo,
    capturedAt: new Date().toISOString(),
  };

  // Shared-origin storage → instant for same-device flows.
  try {
    window.localStorage.setItem(STORAGE_PREFIX + sessionId, JSON.stringify(payload));
  } catch {
    /* ignore */
  }

  // Simulated cloud: delay then "arrive" on the desktop poll.
  window.setTimeout(
    () => {
      try {
        window.localStorage.setItem(CLOUD_PREFIX + sessionId, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
    },
    900 + Math.random() * 1200,
  );

  broadcast(payload);
}

/** Phone: mark the session as done once the photo has been sent. */
export function completeSession(sessionId: string): void {
  try {
    window.localStorage.setItem(CLOUD_PREFIX + sessionId + ':done', 'true');
  } catch {
    /* ignore */
  }
}
