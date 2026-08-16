import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';
import type { ExperimentEntry } from '../content/story';

interface StoryTimelineProps {
  entries: ExperimentEntry[];
  testID?: string;
}

// Vertical timeline displaying experiment milestones
// Entries rendered with connecting line and year markers
export default function StoryTimeline({ entries, testID }: StoryTimelineProps) {
  return (
    <ScrollView
      style={styles.container}
      testID={testID}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator
    >
      {entries.map((entry, index) => (
        <View key={`${entry.year}-${index}`} style={styles.entryWrapper}>
          {/* Connecting line (all entries except last) */}
          {index < entries.length - 1 && <View style={styles.connector} />}

          {/* Year marker + card */}
          <View style={styles.entry}>
            <View style={styles.yearMarkerContainer}>
              <View style={styles.yearMarker}>
                <Text style={styles.yearText}>{entry.year}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.headline}>{entry.headline}</Text>
              <Text style={styles.location}>{entry.location}</Text>
              <Text style={styles.description}>{entry.description}</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: space[4],
  },
  entryWrapper: {
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 28, // Centered on year marker
    top: 0,
    width: 2,
    height: space[8],
    backgroundColor: colors.borderSubtle,
    zIndex: 0,
  },
  entry: {
    flexDirection: 'row',
    paddingVertical: space[6],
    paddingHorizontal: space[4],
  },
  yearMarkerContainer: {
    width: 80,
    alignItems: 'center',
    paddingRight: space[4],
  },
  yearMarker: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0 4px 12px ${colors.brandPrimary}33`,
  },
  yearText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.bodyS,
    color: '#FFFFFF',
    lineHeight: leading(1, fontSize.bodyS),
  },
  card: {
    flex: 1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: 14,
    padding: space[4],
    borderLeftWidth: 3,
    borderLeftColor: colors.brandSecondary,
  },
  headline: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.bodyL,
    color: colors.textPrimary,
    marginBottom: space[1],
    lineHeight: leading(1.3, fontSize.bodyL),
  },
  location: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textTertiary,
    marginBottom: space[2],
    lineHeight: leading(1.3, fontSize.bodyS),
    letterSpacing: tracking(0.02, fontSize.bodyS),
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    lineHeight: leading(1.5, fontSize.bodyS),
  },
  footer: {
    height: space[6],
  },
});
