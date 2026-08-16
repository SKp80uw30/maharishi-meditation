import React, { Dispatch, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppAction } from '../state/appReducer';
import { BackButton, Button, Card, ScreenContainer, Sheet, StoryTimeline } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';
import { worldPeaceApi, type WorldPeaceStats } from '../api/worldPeace';
import { narrative } from '../content/story';

// design_handoff_world_peace_mvp/components/IntentionScreen.jsx +
// README "2. World Peace intention confirmation" — the emotional anchor of the
// MVP: confirms the one fixed intention, doesn't ask the user to choose. Also
// displays live count of current meditators for social proof.
export default function IntentionScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  const [stats, setStats] = useState<WorldPeaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStory, setShowStory] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const result = await worldPeaceApi.getStats();
        if (mounted) {
          setStats(result);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    // Poll for live updates every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeCount = stats?.current_active_estimate ?? 0;
  const activeText = activeCount === 1 ? 'meditator' : 'meditators';

  return (
    <ScreenContainer style={styles.container} testID="screen-intention">
      <BackButton onPress={() => dispatch({ type: 'BACK' })} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        <Text style={styles.microLabel}>Today's intention</Text>
        <Text style={styles.headline}>What energy are you{'\n'}sending into the world today?</Text>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>World Peace & Non-violence</Text>
              <Text style={styles.cardBody}>{narrative.intentionSupportingLine}</Text>
              <Pressable
                onPress={() => setShowStory(true)}
                style={styles.deepDiveLink}
                accessible
                accessibilityRole="link"
                accessibilityLabel="Read the full story"
              >
                <Text style={styles.deepDiveLinkText}>Go deeper →</Text>
              </Pressable>
            </View>
            <View style={styles.activeCount}>
              <Text style={styles.activeNumber}>{activeCount}</Text>
              <Text style={styles.activeLabel}>{activeText}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <Button label="Begin your session" onPress={() => dispatch({ type: 'CONTINUE' })} fullWidth style={styles.cta} />

      {/* Story deep-dive modal */}
      <Sheet isOpen={showStory} onClose={() => setShowStory(false)} title="The Story">
        <ScrollView showsVerticalScrollIndicator>
          <Text style={styles.storyText}>{narrative.originStory}</Text>
          <View style={{ height: space[8] }}>
            <Text style={styles.timelineHeading}>Timeline of Research</Text>
          </View>
          <StoryTimeline entries={narrative.timeline} />
        </ScrollView>
      </Sheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingTop: space[6] + space[1],
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
    paddingHorizontal: space[6] + space[1],
    paddingVertical: space[6],
  },
  microLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    letterSpacing: tracking(0.04, fontSize.caption),
    textTransform: 'uppercase',
    color: colors.brandPrimary,
    textAlign: 'center',
  },
  headline: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    color: colors.textPrimary,
    lineHeight: leading(1.3, 26),
    textAlign: 'center',
  },
  card: {
    width: '100%',
    gap: space[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space[4],
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingS,
    color: colors.textPrimary,
  },
  cardBody: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
  },
  activeCount: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  activeNumber: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: colors.brandPrimary,
    lineHeight: leading(1, 24),
  },
  activeLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  deepDiveLink: {
    marginTop: space[3],
  },
  deepDiveLinkText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textLink,
    textDecorationLine: 'underline',
  },
  storyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textPrimary,
    lineHeight: leading(1.6, fontSize.bodyM),
    marginBottom: space[6],
  },
  timelineHeading: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.headingM,
    color: colors.textPrimary,
    lineHeight: leading(1.3, fontSize.headingM),
  },
  cta: {
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[6],
  },
});
