import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RipplesAnimation from './RipplesAnimation';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize, leading } from '../../theme/typography';
import { space } from '../../theme/spacing';

/**
 * Beat 4: "Many Minds, One Field" — Ripples converge visual
 * Shows collective effect: many individual practices → coherent field
 */
export default function StoryBeat4() {
  return (
    <View style={styles.container}>
      {/* Animated ripples */}
      <View style={styles.animationContainer}>
        <RipplesAnimation />
      </View>

      {/* Content overlay */}
      <View style={styles.content}>
        <Text style={styles.headline}>Many Minds, One Field</Text>
        <Text style={styles.copy}>
          When many minds become coherent together, something shifts in the surrounding world.
        </Text>
        <Text style={styles.subtitle}>This is the Maharishi Effect.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: space[8],
    // Clear StoryOnboarding's bottom bar (dots + Back/Next + progress), which
    // this beat's copy would otherwise sit underneath.
    paddingBottom: space[24] + space[6],
    paddingHorizontal: space[6],
    backgroundColor: palette.cream50,
  },
  animationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: space[4],
  },
  content: {
    alignItems: 'center',
    gap: space[4],
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  copy: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: leading(1.6, fontSize.bodyM),
    maxWidth: 340,
  },
  subtitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyM,
    color: colors.brandPrimary,
    textAlign: 'center',
  },
});
