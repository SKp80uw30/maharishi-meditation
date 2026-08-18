import { useCallback, useEffect, useState } from 'react';
import { hasSeenStory, markStorySeen } from '../storage/storyProgress';

type FirstRunStory = {
  isStoryOpen: boolean;
  /** The manual route in: Intention's "Go deeper" link, available forever. */
  openStory: () => void;
  /** Closes by either route and records that the story has now been shown, so
   * the automatic opening never happens twice. */
  closeStory: () => void;
};

/** Owns both routes into the story onboarding: it opens itself on a person's
 * first arrival, and can be opened by hand any time after that.
 *
 * The automatic opening is deliberately keyed to *shown*, not *finished*.
 * Skipping is an explicit "not now", and this app has no notifications, no
 * streaks and no nagging anywhere else; re-opening the story over the intention
 * screen on the next launch would be the one place it did. Nothing is lost by
 * respecting the dismissal, because "Go deeper" keeps the story permanently
 * reachable. To gate on completion instead, move the `markStorySeen()` call out
 * of `closeStory` and fire it only from the final beat's CTA. */
export function useFirstRunStory(): FirstRunStory {
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    hasSeenStory().then((seen) => {
      if (mounted && !seen) setIsStoryOpen(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const openStory = useCallback(() => setIsStoryOpen(true), []);

  const closeStory = useCallback(() => {
    setIsStoryOpen(false);
    // Not awaited: closing the story shouldn't wait on a disk write, and there
    // is nothing to do if it fails.
    void markStorySeen();
  }, []);

  return { isStoryOpen, openStory, closeStory };
}
