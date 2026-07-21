import React from 'react';
import { Text } from 'react-native';
import { Dispatch } from 'react';
import { AppAction } from '../state/appReducer';
import { ScreenContainer } from '../components';

// Placeholder wiring for Phase 2 — full visual build happens in Phase 3.
export default function LaunchScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer wash="glow" testID="screen-launch">
      <Text onPress={() => dispatch({ type: 'BEGIN' })}>Begin</Text>
      <Text onPress={() => dispatch({ type: 'OPEN_ABOUT' })}>About</Text>
    </ScreenContainer>
  );
}
