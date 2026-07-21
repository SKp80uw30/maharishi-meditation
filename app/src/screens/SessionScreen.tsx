import React, { Dispatch, useEffect } from 'react';
import { Text } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { ScreenContainer } from '../components';

// Placeholder wiring for Phase 2 — the real timer hook, ring, and auto-advance
// land in Phase 6. This version just proves the reducer plumbing works: a
// interval ticks the state, and reaching 0 in timed mode auto-advances.
export default function SessionScreen({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}) {
  const isOpen = state.duration === 'open';

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  useEffect(() => {
    if (!isOpen && state.secondsLeft === 0) {
      dispatch({ type: 'FINISH_SESSION' });
    }
  }, [isOpen, state.secondsLeft, dispatch]);

  return (
    <ScreenContainer variant="dark" wash="duskGlow" testID="screen-session">
      <Text onPress={() => dispatch({ type: 'TOGGLE_SOUND' })}>{state.soundOn ? 'Sound on' : 'Sound off'}</Text>
      <Text>{isOpen ? state.secondsElapsed : state.secondsLeft}</Text>
      <Text onPress={() => dispatch({ type: 'END_SESSION_EARLY' })}>{isOpen ? 'End session' : 'End early'}</Text>
    </ScreenContainer>
  );
}
