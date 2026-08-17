import React, { Dispatch } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { Button, ProgressRing, ScreenContainer } from '../components';
import { useSessionTimer, formatClock } from '../hooks/useSessionTimer';
import { useAmbientLoop } from '../hooks/useAmbientLoop';
import { usePresence } from '../hooks/usePresence';
import { WorldPeaceApiClient, worldPeaceApi } from '../api/worldPeace';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { radius, space } from '../theme/spacing';
import { narrative } from '../content/story';

// design_handoff_world_peace_mvp/components/SessionScreen.jsx +
// README "4. Meditation session" — the app's one dark surface, meant to feel
// like closed-eyes dusk. Runs entirely on-device; no network calls here.
export default function SessionScreen({
  state,
  dispatch,
  apiClient = worldPeaceApi,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  /** Injectable for tests; defaults to the app's real client. */
  apiClient?: WorldPeaceApiClient;
}) {
  const duration = state.duration ?? 'open'; // guarded upstream by the reducer's START_SESSION check
  const isOpen = duration === 'open';

  const { seconds, progress } = useSessionTimer({
    duration,
    onFinish: () => dispatch({ type: 'FINISH_SESSION' }),
  });

  useAmbientLoop(state.soundOn);

  // Declares this session live for as long as the screen is mounted, and tells
  // us how many others are meditating at the same moment.
  const others = usePresence(duration, apiClient);

  return (
    <ScreenContainer variant="dark" wash="duskGlow" style={styles.container} testID="screen-session">
      <SoundToggle soundOn={state.soundOn} onPress={() => dispatch({ type: 'TOGGLE_SOUND' })} />

      <ProgressRing progress={progress}>
        <Text style={styles.clock}>{formatClock(seconds)}</Text>
        <Text style={styles.caption}>{isOpen ? 'Open session' : 'World Peace'}</Text>
      </ProgressRing>

      <View style={styles.textBlock}>
        <Text style={styles.supporting}>
          {narrative.sessionPresence(others)}
          {state.soundOn ? ' A gentle ambient tone plays as you go.' : ''}
        </Text>
        <Text style={styles.narrativeCompanion}>{narrative.sessionCompanionLine}</Text>
      </View>

      <Button
        variant="outline"
        label={isOpen ? 'End session' : 'End early'}
        onPress={() => dispatch({ type: 'END_SESSION_EARLY' })}
      />
    </ScreenContainer>
  );
}

function SoundToggle({ soundOn, onPress }: { soundOn: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={soundOn ? 'Sound on' : 'Sound off'}
      style={[styles.soundToggle, soundOn && styles.soundToggleOn]}
    >
      <Text style={styles.soundToggleLabel}>{soundOn ? 'Sound on' : 'Sound off'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[8],
  },
  soundToggle: {
    position: 'absolute',
    top: space[6],
    right: space[6],
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.pill,
    paddingVertical: space[2],
    paddingHorizontal: space[4],
  },
  soundToggleOn: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  soundToggleLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.sessionTextSecondary,
  },
  clock: {
    fontFamily: fontFamily.extrabold,
    fontSize: 38,
    color: colors.sessionTextPrimary,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.sessionTextTertiary,
    marginTop: space[1],
    letterSpacing: tracking(0.04, fontSize.caption),
    textTransform: 'uppercase',
  },
  textBlock: {
    gap: space[4],
    alignItems: 'center',
  },
  supporting: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.sessionTextSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  narrativeCompanion: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.sessionTextTertiary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: leading(1.4, fontSize.bodyS),
    fontStyle: 'italic',
  },
});
