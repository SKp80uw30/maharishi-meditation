import React, { Dispatch } from 'react';
import { Text } from 'react-native';
import { AppAction } from '../state/appReducer';
import { ScreenContainer } from '../components';

// Placeholder wiring for Phase 2 — full visual build happens in Phase 4.
export default function IntentionScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer testID="screen-intention">
      <Text onPress={() => dispatch({ type: 'BACK' })}>Back</Text>
      <Text onPress={() => dispatch({ type: 'CONTINUE' })}>Begin your session</Text>
    </ScreenContainer>
  );
}
