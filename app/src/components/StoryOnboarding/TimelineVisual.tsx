import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { palette, colors } from '../../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../../theme/typography';
import { space } from '../../theme/spacing';
import { narrative } from '../../content/story';

/**
 * Vertical timeline showing 5 key research milestones (1973-2024).
 * Visual showing the connecting line and milestone markers; animation can be added later.
 */
export default function TimelineVisual() {

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Vertical connecting line */}
        <View style={styles.timelineLineContainer}>
          <View style={styles.timelineLine} />
        </View>

        {/* Timeline items */}
        {narrative.timeline.map((entry, index) => (
          <View key={entry.year} style={styles.timelineItem}>
            {/* Milestone dot */}
            <View style={styles.milestoneMarker}>
              <View style={styles.markerDot} />
            </View>

            {/* Content */}
            <View style={styles.itemContent}>
              <Text style={styles.year}>{entry.year}</Text>
              <Text style={styles.location}>{entry.location}</Text>
              <Text style={styles.headline}>{entry.headline}</Text>
              <Text style={styles.description}>{entry.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingTop: space[6],
    // Clear the absolutely-positioned Back/Next controls StoryOnboarding
    // overlays at the bottom of the screen.
    paddingBottom: space[24] + space[6],
  },
  container: {
    position: 'relative',
    paddingHorizontal: space[6],
    paddingRight: space[2],
  },
  timelineLineContainer: {
    position: 'absolute',
    left: space[6] + 12, // Align with milestone dot
    top: 0,
    bottom: 0,
    width: 2,
  },
  timelineLine: {
    flex: 1,
    backgroundColor: palette.terracotta500,
    opacity: 0.4,
  },
  flowingDot: {
    position: 'absolute',
    left: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.terracotta500,
    opacity: 0.6,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: space[6],
    alignItems: 'flex-start',
  },
  milestoneMarker: {
    width: 32,
    height: 32,
    marginRight: space[4],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brandPrimary,
    borderWidth: 3,
    borderColor: palette.cream50,
    boxShadow: `0 0 8px ${colors.brandPrimary}40`,
  },
  itemContent: {
    flex: 1,
    paddingLeft: space[3],
  },
  year: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.headingS,
    color: colors.brandPrimary,
    marginBottom: space[1],
  },
  location: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: tracking(0.04, fontSize.caption),
    marginBottom: space[2],
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingM,
    color: colors.textPrimary,
    lineHeight: leading(1.3, fontSize.headingM),
    marginBottom: space[2],
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    lineHeight: leading(1.5, fontSize.bodyS),
  },
});
