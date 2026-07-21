import React, { Dispatch } from 'react';
import { Text } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { ScreenContainer } from '../components';

const OPTIONS: Array<number | 'open'> = [3, 5, 10, 20, 'open'];

// Placeholder wiring for Phase 2 — full visual build happens in Phase 5.
export default function DurationScreen({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}) {
  return (
    <ScreenContainer testID="screen-duration">
      <Text onPress={() => dispatch({ type: 'BACK' })}>Back</Text>
      {OPTIONS.map((option) => (
        <Text key={option} onPress={() => dispatch({ type: 'SELECT_DURATION', duration: option })}>
          {option === 'open' ? 'Open' : `${option}`}
          {state.duration === option ? ' (selected)' : ''}
        </Text>
      ))}
      <Text onPress={() => dispatch({ type: 'START_SESSION' })}>Begin meditation</Text>
    </ScreenContainer>
  );
}
