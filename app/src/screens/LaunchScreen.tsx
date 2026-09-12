import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import { AppAction } from '../state/appReducer';
import { Button, BlobMark, ScreenContainer, StoryOnboarding } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, tracking, leading } from '../theme/typography';
import { space } from '../theme/spacing';
import { narrative } from '../content/story';

// design_handoff_world_peace_mvp/components/LaunchScreen.jsx +
// README "1. Launch screen". The info affordance to About is a README
// requirement not shown in the literal JSX ("reachable via a small info
// affordance from Launch, not part of the core linear ritual") — placed as an
// unobtrusive top-right glyph so it doesn't compete with the single "Begin" CTA.
//
// The origin story's opening beat (1973, Washington DC) is the main copy here,
// every launch — not a one-time onboarding fact. The point is repetition: a
// daily reminder of why this practice exists, not a story told once and then
// assumed remembered. Two CTAs, not one: "Tell me more" opens the full 5-beat
// StoryOnboarding for anyone who wants the deeper account; "Skip story and get
// started" begins immediately for anyone who already knows it. Neither is the
// "real" path — the one-line hook already stands on its own, these are just
// two ways to leave it.
export default function LaunchScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

      <Animated.View
        style={[
          styles.content,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <BlobMark size={120} glow breathing />

        <View style={styles.textBlock}>
          <Text style={styles.eyebrow}>{narrative.launchEyebrow}</Text>
          <Text style={styles.title}>One Field</Text>
          <Text style={styles.subtitle}>{narrative.launchSubtitle}</Text>
        </View>

        <View style={styles.ctaBlock}>
          <Text style={styles.ctaCaption}>{narrative.launchCtaCaption}</Text>
          <Button label="Tell me more" onPress={() => setIsStoryOpen(true)} />
          <Button
            label="Skip story and get started"
            variant="secondary"
            onPress={() => dispatch({ type: 'BEGIN' })}
          />
        </View>
      </Animated.View>

      {/* onClose fires for every exit from the modal alike — Beat 5's "Begin
       * your session", its own "Skip story", and the corner X — so it also
       * dispatches BEGIN. Without that, leaving the modal just re-reveals
       * this same Launch screen, trapping anyone who taps "Tell me more" in
       * a loop with no way to actually reach Intention. */}
      <StoryOnboarding
        isOpen={isStoryOpen}
        onClose={() => {
          setIsStoryOpen(false);
          dispatch({ type: 'BEGIN' });
        }}
      />
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
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    letterSpacing: tracking(0.04, fontSize.caption),
    textTransform: 'uppercase',
    color: colors.brandPrimary,
    textAlign: 'center',
    marginBottom: space[2],
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.displayM,
    color: colors.textPrimary,
    letterSpacing: tracking(0.02, fontSize.displayM),
    lineHeight: leading(1.2, fontSize.displayM),
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
    lineHeight: leading(1.5, fontSize.bodyM),
    marginTop: space[2],
    maxWidth: 320,
    textAlign: 'center',
  },
  ctaBlock: {
    alignItems: 'center',
    gap: space[3],
  },
  ctaCaption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    maxWidth: 240,
    textAlign: 'center',
  },
});
