import React, { Dispatch } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppAction } from '../state/appReducer';
import { Button, BlobMark, ScreenContainer } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, tracking } from '../theme/typography';
import { space } from '../theme/spacing';

// design_handoff_world_peace_mvp/components/LaunchScreen.jsx +
// README "1. Launch screen". The info affordance to About is a README
// requirement not shown in the literal JSX ("reachable via a small info
// affordance from Launch, not part of the core linear ritual") — placed as an
// unobtrusive top-right glyph so it doesn't compete with the single "Begin" CTA.
export default function LaunchScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer wash="glow" style={styles.container} testID="screen-launch">
      <Pressable
        onPress={() => dispatch({ type: 'OPEN_ABOUT' })}
        accessibilityRole="button"
        accessibilityLabel="About"
        style={styles.aboutAffordance}
        hitSlop={12}
      >
        <Text style={styles.aboutGlyph}>ⓘ</Text>
      </Pressable>

      <View style={styles.content}>
        <BlobMark size={120} glow />

        <View style={styles.textBlock}>
          <Text style={styles.title}>Maharishi Meditation</Text>
          <Text style={styles.subtitle}>A shared meditation for World Peace.</Text>
        </View>

        <Button label="Begin" onPress={() => dispatch({ type: 'BEGIN' })} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[8],
  },
  aboutAffordance: {
    position: 'absolute',
    top: space[6],
    right: space[6],
  },
  aboutGlyph: {
    fontSize: fontSize.headingM,
    color: colors.textTertiary,
  },
  content: {
    alignItems: 'center',
    gap: space[6] + space[1],
  },
  textBlock: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.displayM,
    color: colors.textPrimary,
    letterSpacing: tracking(-0.01, fontSize.displayM),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
    marginTop: space[2],
    maxWidth: 260,
    textAlign: 'center',
  },
});
