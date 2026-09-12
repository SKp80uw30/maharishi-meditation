import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TimelineVisual from './TimelineVisual';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { space } from '../../theme/spacing';

/**
 * Beat 3: "Fifty Years" — Timeline of key research milestones
 * Shows the lineage: individual studies converge into documented pattern
 */
export default function StoryBeat3() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headline}>50 Years Growing the Field</Text>
        <Text style={styles.subtitle}>Key research milestones from 1973 to now</Text>
      </View>

      <TimelineVisual />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: space[6],
    backgroundColor: palette.cream50,
  },
  header: {
    paddingHorizontal: space[6],
    paddingTop: space[4],
    marginBottom: space[4],
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    color: colors.textPrimary,
    marginBottom: space[2],
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
  },
  footer: {
    paddingVertical: space[4],
    paddingHorizontal: space[6],
    alignItems: 'center',
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
