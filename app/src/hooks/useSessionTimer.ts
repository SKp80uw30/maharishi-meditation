import { useEffect, useRef, useState } from 'react';

type Args = {
  duration: number | 'open';
  /** Fires exactly once, when a timed session counts down to 0:00. Never fires
   * in Open mode — there's no total to reach. */
  onFinish: () => void;
};

type Result = {
  /** Seconds remaining (timed mode) or elapsed (Open mode) — whichever the
   * current mode actually measures. */
  seconds: number;
  /** 0–1 elapsed fraction for the progress ring, or `null` in Open mode. */
  progress: number | null;
};

/** Drives the Session screen's on-device timer. Deliberately local/ephemeral
 * state (not part of the app reducer) — per CLAUDE.md's state model, session
 * timing "lives for the duration of the Session screen" only, and ticking it
 * globally would re-render the whole app tree every second for no reason. */
export function useSessionTimer({ duration, onFinish }: Args): Result {
  const isOpen = duration === 'open';
  const total = isOpen ? 0 : duration * 60;

  const [seconds, setSeconds] = useState(isOpen ? 0 : total);

  // Keep the latest onFinish without re-running the finish-detection effect
  // every time the caller passes a new function identity.
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Reset if the caller starts a new session with a different duration.
  useEffect(() => {
    setSeconds(isOpen ? 0 : total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((prev) => (isOpen ? prev + 1 : Math.max(0, prev - 1)));
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen && seconds === 0) {
      onFinishRef.current();
    }
  }, [isOpen, seconds]);

  const progress = isOpen ? null : total === 0 ? 1 : 1 - seconds / total;

  return { seconds, progress };
}

/** Formats a seconds count as MM:SS, per the design spec. */
export function formatClock(totalSeconds: number): string {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
