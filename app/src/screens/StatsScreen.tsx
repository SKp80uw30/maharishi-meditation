import React, { Dispatch } from 'react';
import { Text } from 'react-native';
import { AppAction } from '../state/appReducer';
import { ScreenContainer } from '../components';

// Placeholder wiring for Phase 2 — real API client + stat cards land in Phase 8.
export default function StatsScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer testID="screen-stats">
      <Text>Session complete</Text>
      <Text onPress={() => dispatch({ type: 'RESTART' })}>Meditate again</Text>
    </ScreenContainer>
  );
}
