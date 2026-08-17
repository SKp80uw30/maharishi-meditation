import React, { useState } from 'react';
import { View, Modal, Pressable, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import StoryBeat1 from './StoryBeat1';
import StoryBeat2 from './StoryBeat2';
import StoryBeat3 from './StoryBeat3';
import StoryBeat4 from './StoryBeat4';
import StoryBeat5 from './StoryBeat5';
import { palette, colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import { space } from '../../theme/spacing';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const BEATS = [
  { Component: StoryBeat1, key: 'beat1' },
  { Component: StoryBeat2, key: 'beat2' },
  { Component: StoryBeat3, key: 'beat3' },
  { Component: StoryBeat4, key: 'beat4' },
  { Component: StoryBeat5, key: 'beat5' },
];

/**
 * Full-screen immersive story onboarding with 5 beats.
 * Navigation: tap continue button, keyboard arrows, or beat-specific CTAs.
 * Always includes Skip button to respect user freedom.
 */
export default function StoryOnboarding({ isOpen, onClose }: Props) {
  const [currentBeat, setCurrentBeat] = useState(0);

  const handleNext = () => {
    if (currentBeat < BEATS.length - 1) {
      setCurrentBeat(currentBeat + 1);
      AccessibilityInfo.announceForAccessibility(`Beat ${currentBeat + 2} of ${BEATS.length}`);
    } else {
      // Beat 5 CTA → close and start session
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentBeat > 0) {
      setCurrentBeat(currentBeat - 1);
      AccessibilityInfo.announceForAccessibility(`Beat ${currentBeat} of ${BEATS.length}`);
    }
  };

  const handleSkip = () => {
    setCurrentBeat(0);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={false}
      onRequestClose={handleSkip}
      testID="story-onboarding"
    >
      <View style={styles.container}>
        {/* Close button (skip) */}
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Skip story"
          hitSlop={12}
        >
          <View style={styles.skipIcon} />
        </Pressable>

        {/* Current beat */}
        {currentBeat === 0 && <StoryBeat1 />}
        {currentBeat === 1 && <StoryBeat2 />}
        {currentBeat === 2 && <StoryBeat3 />}
        {currentBeat === 3 && <StoryBeat4 />}
        {currentBeat === 4 && <StoryBeat5 onContinue={handleNext} onSkip={handleSkip} />}

        {/* Bottom bar: progress dots + navigation, for beats 1-4. The final
         * beat carries its own CTA block, so it gets no bar. */}
        {currentBeat < BEATS.length - 1 && (
          <View style={styles.navButtonsContainer}>
            <View style={styles.indicators}>
              {BEATS.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    setCurrentBeat(index);
                    AccessibilityInfo.announceForAccessibility(`Beat ${index + 1} of ${BEATS.length}`);
                  }}
                  accessible
                  accessibilityRole="tab"
                  accessibilityLabel={`Story beat ${index + 1}`}
                  accessibilityState={{ selected: index === currentBeat }}
                >
                  <View
                    style={[
                      styles.indicator,
                      index === currentBeat && styles.indicatorActive,
                      index < currentBeat && styles.indicatorComplete,
                    ]}
                  />
                </Pressable>
              ))}
            </View>
            <View style={styles.navButtons}>
              {currentBeat > 0 && (
                <Pressable
                  onPress={handlePrevious}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Previous story beat"
                  style={({ pressed }) => [
                    styles.navButton,
                    pressed && styles.navButtonPressed,
                  ]}
                >
                  <Text style={styles.navArrowText}>← Back</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleNext}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Next story beat"
                style={({ pressed }) => [
                  styles.navButton,
                  pressed && styles.navButtonPressed,
                ]}
              >
                <Text style={styles.navArrowText}>Next →</Text>
              </Pressable>
            </View>
            <Text style={styles.beatProgress}>
              {currentBeat + 1} of {BEATS.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream50,
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  skipIcon: {
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.textTertiary,
    opacity: 0.5,
    transform: [{ rotateZ: '45deg' }],
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: space[3],
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
    opacity: 0.3,
  },
  indicatorActive: {
    backgroundColor: colors.brandPrimary,
    opacity: 1,
    width: 24,
  },
  indicatorComplete: {
    backgroundColor: palette.sage500,
    opacity: 0.7,
  },
  navButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    paddingHorizontal: space[6],
    // Solid backdrop so scrolling beat content (e.g. Beat 3's timeline)
    // passes behind the nav instead of colliding with it visually.
    backgroundColor: palette.cream50,
    paddingTop: space[3],
    paddingBottom: space[4],
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: space[3],
  },
  navButton: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: 8,
    backgroundColor: colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  navButtonPressed: {
    opacity: 0.8,
    backgroundColor: colors.brandPrimaryPress,
  },
  navArrowText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: fontFamily.bold,
  },
  beatProgress: {
    fontSize: 12,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
