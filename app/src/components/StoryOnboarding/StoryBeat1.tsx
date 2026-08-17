import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlobMark } from '../index';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../../theme/typography';
import { space } from '../../theme/spacing';

/**
 * Beat 1: "Something Shifted" — Hero blob with breathing animation
 * Establishes the moment and mood: discovery, aliveness, presence
 */
export default function StoryBeat1() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Breathing blob signals: this practice is alive */}
        <View style={styles.blobContainer}>
          <BlobMark size={140} glow breathing />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Something Shifted</Text>

        {/* Story opening */}
        <Text style={styles.copy}>
          In 1973, something unexpected happened in Washington DC.
        </Text>

        {/* Secondary */}
        <Text style={styles.secondary}>A group of 400 meditators gathered with a single intention: to meditate for peace.</Text>
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
  blobContainer: {
    marginBottom: space[4],
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: tracking(0.015, 32),
    textAlign: 'center',
    marginBottom: space[3],
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
    maxWidth: 320,
  },
});
