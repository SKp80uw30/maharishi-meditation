import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BlobMark, Button } from '../index';
import { worldPeaceApi } from '../../api/worldPeace';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize, leading } from '../../theme/typography';
import { space } from '../../theme/spacing';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = {
  onContinue: () => void;
  onSkip: () => void;
};

/**
 * Beat 5: "Now It's You" — Call to action with live meditator count
 * Shows user's role in the constellation; live badge connects to collective
 */
export default function StoryBeat5({ onContinue, onSkip }: Props) {
  // null = no estimate available (it's optional in the API contract, and the
  // request can simply fail). A real zero is treated the same way below —
  // neither should render "0 people are meditating".
  const [activeCount, setActiveCount] = useState<number | null>(null);
  // useRef, not a bare `new Animated.Value()`: a fresh value object on every
  // render would change the effect's dependency every render, re-firing the
  // fetch in a loop.
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    worldPeaceApi
      .getStats()
      .then((stats) => {
        if (cancelled) return;
        const estimate = stats?.current_active_estimate ?? null;
        setActiveCount(estimate);
        if (estimate == null) return;
        if (reducedMotion) {
          scaleAnim.setValue(1);
          return;
        }
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 3,
        }).start();
      })
      .catch(() => {
        // The story shouldn't break because a count didn't load.
      });
    return () => {
      cancelled = true;
    };
  }, [scaleAnim, reducedMotion]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>Now It's You</Text>

        {/* Glowing blob + live count */}
        <View style={styles.blobSection}>
          <BlobMark size={100} glow breathing />
          {activeCount != null && activeCount > 0 && (
            <Animated.View
              style={[
                styles.liveCount,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.countNumber}>{activeCount}</Text>
              <Text style={styles.countLabel}>meditating now</Text>
            </Animated.View>
          )}
        </View>

        {/* Message */}
        <Text style={styles.copy}>
          {activeCount != null && activeCount > 0
            ? `Right now, ${activeCount} people are meditating for World Peace.`
            : 'Right now, others are meditating for World Peace.'}
        </Text>
        <Text style={styles.secondary}>Your practice joins theirs into one coherent field.</Text>
      </View>

      {/* CTAs */}
      <View style={styles.buttonGroup}>
        <Button label="Begin your session" onPress={onContinue} fullWidth />
        <Button label="Skip story" onPress={onSkip} variant="outline" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[8],
    paddingHorizontal: space[6],
    backgroundColor: palette.cream50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space[6],
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 32,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  blobSection: {
    alignItems: 'center',
    gap: space[4],
  },
  liveCount: {
    alignItems: 'center',
  },
  countNumber: {
    fontFamily: fontFamily.extrabold,
    fontSize: 48,
    color: colors.brandPrimary,
    lineHeight: 56,
  },
  countLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: space[1],
  },
  copy: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: leading(1.6, fontSize.bodyM),
    maxWidth: 340,
  },
  secondary: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: leading(1.6, fontSize.bodyS),
    maxWidth: 340,
  },
  buttonGroup: {
    width: '100%',
    gap: space[3],
  },
});
