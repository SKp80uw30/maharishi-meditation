import { useEffect, useRef, useState } from 'react';
import { createSessionId, worldPeaceApi, WorldPeaceApiClient } from '../api/worldPeace';

/** Grace added to a timed session's declared length, so a session that runs a
 * few seconds long (or whose end request is slow) doesn't blink out of the
 * live count just before it finishes. */
export const TIMED_GRACE_SECONDS = 60;

/** Open-ended sessions have no known end, so they're the only case that needs
 * a heartbeat. The hold is deliberately a small multiple of the interval: long
 * enough that one dropped ping doesn't evict a real meditator, short enough
 * that someone who force-quits stops being counted quickly. */
export const HEARTBEAT_INTERVAL_SECONDS = 120;
export const OPEN_HOLD_SECONDS = HEARTBEAT_INTERVAL_SECONDS * 2.5;

/** How long to claim presence for, given the chosen duration. A timed session
 * declares its whole length up front, which is why it needs no heartbeat at
 * all — the entry is set to expire when the session was always going to end. */
export function holdSecondsFor(duration: number | 'open' | null): number {
  if (duration === 'open' || duration == null) return OPEN_HOLD_SECONDS;
  return duration * 60 + TIMED_GRACE_SECONDS;
}

/**
 * Declares "someone is meditating right now" for as long as the Session screen
 * is mounted, and reports how many *others* are meditating at the same time.
 *
 * Presence is deliberately separate from the completion counter (which fires
 * once, later, on the Stats screen): one describes people mid-session, the
 * other describes sessions already finished.
 */
export function usePresence(
  duration: number | 'open' | null,
  apiClient: WorldPeaceApiClient = worldPeaceApi,
): number | null {
  const [others, setOthers] = useState<number | null>(null);
  // One id per mounted session, kept out of state so it can't change identity
  // and re-trigger the effect.
  const sessionIdRef = useRef<string | null>(null);
  if (sessionIdRef.current === null) sessionIdRef.current = createSessionId();

  useEffect(() => {
    const sessionId = sessionIdRef.current!;
    const holdSeconds = holdSecondsFor(duration);
    let cancelled = false;

    const announce = async () => {
      try {
        const count = await apiClient.startPresence(sessionId, holdSeconds);
        if (!cancelled) setOthers(count);
      } catch {
        // Presence is ambient texture, never load-bearing — a failure here must
        // not interrupt someone's meditation. The count just stays unknown.
      }
    };

    announce();

    // Only open-ended sessions need refreshing; a timed session's hold already
    // covers its whole length.
    const needsHeartbeat = duration === 'open' || duration == null;
    const timer = needsHeartbeat
      ? setInterval(announce, HEARTBEAT_INTERVAL_SECONDS * 1000)
      : null;

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      // Leaving the screen ends presence immediately. If this never lands (the
      // app is killed, the network drops), the hold above expires on its own.
      apiClient.endPresence(sessionId).catch(() => {});
    };
  }, [duration, apiClient]);

  return others;
}
