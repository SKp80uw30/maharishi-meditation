import React, { useReducer } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_300Light,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { appReducer, initialState } from './src/state/appReducer';
import LaunchScreen from './src/screens/LaunchScreen';
import IntentionScreen from './src/screens/IntentionScreen';
import DurationScreen from './src/screens/DurationScreen';
import SessionScreen from './src/screens/SessionScreen';
import StatsScreen from './src/screens/StatsScreen';
import AboutScreen from './src/screens/AboutScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [state, dispatch] = useReducer(appReducer, initialState);

  if (!fontsLoaded) {
    // Nunito is the design system's typeface (see app/src/theme/typography.ts);
    // avoid a flash of the system font by rendering nothing until it's ready.
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={state.screen === 'session' ? 'light' : 'dark'} />
      {state.screen === 'launch' && <LaunchScreen dispatch={dispatch} />}
      {state.screen === 'intention' && <IntentionScreen dispatch={dispatch} />}
      {state.screen === 'duration' && <DurationScreen state={state} dispatch={dispatch} />}
      {state.screen === 'session' && <SessionScreen state={state} dispatch={dispatch} />}
      {state.screen === 'stats' && <StatsScreen state={state} dispatch={dispatch} />}
      {state.screen === 'about' && <AboutScreen dispatch={dispatch} />}
    </SafeAreaProvider>
  );
}
