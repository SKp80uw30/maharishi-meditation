import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AnimatedCounter from './AnimatedCounter';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize, leading } from '../../theme/typography';
import { space } from '../../theme/spacing';

/**
 * Beat 2: "The Numbers" — Animated statistics reveal
 * Celebrates the discovery: -16% crime drop when meditators gathered
 */
export default function StoryBeat2() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Headline */}
        <Text style={styles.headline}>The Researchers Noticed Something</Text>

        {/* Statistics side-by-side */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <AnimatedCounter value={16} suffix="%" label="Crime dropped" isNegative />
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.descriptionSmall}>When the group dispersed...</Text>
            <Text style={styles.descriptionSmall}>...it rose again</Text>
          </View>
        </View>

        {/* Interpretation */}
        <Text style={styles.copy}>
          They weren't trying to send anything. The meditators were simply practicing. Yet the effect appeared anyway.
        </Text>

        <Text style={styles.secondary}>The world noticed.</Text>
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
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: space[3],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: space[4],
    gap: space[4],
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 120,
    backgroundColor: colors.textTertiary,
    opacity: 0.3,
  },
  descriptionSmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: leading(1.4, fontSize.bodyS),
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
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyM,
    color: colors.brandPrimary,
    textAlign: 'center',
  },
});
