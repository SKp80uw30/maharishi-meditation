import React, { Dispatch } from 'react';
import { Text } from 'react-native';
import { AppAction } from '../state/appReducer';
import { ScreenContainer } from '../components';

// Placeholder wiring for Phase 2 — full visual build happens in Phase 9.
export default function AboutScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer testID="screen-about">
      <Text onPress={() => dispatch({ type: 'BACK' })}>Back</Text>
      <Text>Privacy, simply</Text>
    </ScreenContainer>
  );
}
