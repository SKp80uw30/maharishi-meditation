import { useEffect } from 'react';
import { useAudioPlayer } from 'expo-audio';

// PLACEHOLDER AUDIO — see app/assets/audio/README.md. Synthesized locally
// (not sourced from a third party) specifically to avoid any licensing
// ambiguity for the design system's yet-unbuilt real brand audio; swap the file
// at app/assets/audio/ambient-loop.mp3 for real brand audio when it exists —
// same treatment the design handoff already gives the Nunito font and Phosphor
// icons ("placeholder pending real assets").
const ambientLoopSource = require('../../assets/audio/ambient-loop.mp3');

/** Plays/pauses the Session screen's ambient tone in lockstep with `active`
 * (soundOn && mounted on Session). The player is created once per mount and
 * auto-released by expo-audio when the component unmounts — see README
 * "Sound toggle... session-scoped, no account to persist to." */
export function useAmbientLoop(active: boolean) {
  const player = useAudioPlayer(ambientLoopSource);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);
}
