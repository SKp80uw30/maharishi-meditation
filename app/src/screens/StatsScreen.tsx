import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Animated } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { BlobMark, Button, Card, ScreenContainer, Sheet } from '../components';
import { WorldPeaceApiClient, WorldPeaceStats, worldPeaceApi } from '../api/worldPeace';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';
import { shadow } from '../theme/effects';
import { narrative } from '../content/story';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  /** Injectable for tests; defaults to the app's real client (currently the
   * in-memory mock — see app/src/api/worldPeace.ts). */
  apiClient?: WorldPeaceApiClient;
};

// design_handoff_world_peace_mvp/components/StatsScreen.jsx + README
// "5. Reflection and stats" — the only screen in the core flow that touches the
// backend. Increment fires once, on arrival here (see CLAUDE.md "API contract"
// for why: covers both natural timeout and "End early" with one trigger).
export default function StatsScreen({ state, dispatch, apiClient = worldPeaceApi }: Props) {
  const [stats, setStats] = useState<WorldPeaceStats | null>(null);
  // True once the increment+fetch has finished, success or failure — the
  // scale-in below must also run for the "—" placeholders on failure, or
  // they'd stay at scale 0 and the cards would look empty.
  const [statsSettled, setStatsSettled] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  // Picked once per arrival at Stats, not per re-render, so the line doesn't
  // shuffle under the person while they're reading it.
  const afterglowQuote = useRef(
    narrative.afterglowQuotes[Math.floor(Math.random() * narrative.afterglowQuotes.length)]
  ).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await apiClient.increment();
        const result = await apiClient.getStats();
        if (!cancelled) setStats(result);
      } catch {
        // Stats are inspirational, not load-bearing — a failed fetch shouldn't
        // block the ritual. Numbers just stay as the "—" placeholder below and
        // "Meditate again" still works.
      } finally {
        if (!cancelled) setStatsSettled(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Deliberately once per mount (arrival at Stats), not per apiClient identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect to animate stat numbers (or placeholders) in once the
  // fetch settles either way
  useEffect(() => {
    if (!statsSettled || reducedMotion === null) return;
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
  }, [statsSettled, scaleAnim, reducedMotion]);

  const minutes = state.duration === 'open' ? null : state.duration;

  return (
    <ScreenContainer style={styles.container} testID="screen-stats">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
        <BlobMark size={64} glow={false} />
        <Text style={styles.heading}>You held the space.</Text>
        <Text style={styles.supporting}>{narrative.statsThankYou(minutes)}</Text>

        <View style={styles.stats}>
          <StatRow
            label="World Peace meditations today"
            value={stats?.total_today}
            valueColor={colors.brandPrimary}
            scaleAnim={scaleAnim}
          />
          <StatRow label="All time" value={stats?.total_all_time} valueColor={colors.textPrimary} scaleAnim={scaleAnim} />
        </View>

        {/* Heart card — the why. The onboarding origin-story card that used to
         * sit here was removed: it just repeated the Launch-screen story
         * right after the person had personally lived it, which undersold
         * the moment rather than honoring it. */}
        <Card style={styles.heartCard}>
          <Text style={styles.heartText}>{afterglowQuote}</Text>
          <Pressable
            onPress={() => setShowHeart(true)}
            style={styles.factLink}
            accessible
            accessibilityRole="link"
            accessibilityLabel="Read our why"
          >
            <Text style={styles.factLinkText}>Read our why →</Text>
          </Pressable>
        </Card>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <Button label="Meditate again" onPress={() => dispatch({ type: 'RESTART' })} fullWidth />
        <Button label="Home" onPress={() => dispatch({ type: 'HOME' })} variant="secondary" fullWidth />
      </View>

      {/* Heart/mission deep-dive modal — why the app exists */}
      <Sheet isOpen={showHeart} onClose={() => setShowHeart(false)} title="Our Why">
        <ScrollView showsVerticalScrollIndicator>
          <Text style={styles.storyText}>{narrative.heartMessage}</Text>
        </ScrollView>
      </Sheet>
    </ScreenContainer>
  );
}

function StatRow({
  label,
  value,
  valueColor,
  scaleAnim,
}: {
  label: string;
  value: number | undefined;
  valueColor: string;
  scaleAnim: Animated.Value;
}) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Animated.Text
        style={[
          styles.statValue,
          { color: valueColor },
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {value != null ? value.toLocaleString() : '—'}
      </Animated.Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: space[5],
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: space[8],
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[6],
    gap: space[5],
  },
  heading: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingL,
    color: colors.textPrimary,
    letterSpacing: tracking(0.01, fontSize.headingL),
    textAlign: 'center',
  },
  supporting: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
  },
  stats: {
    width: '100%',
    gap: space[3],
    marginTop: space[2],
  },
  statCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 201, 139, 0.06)',
  },
  statLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    flexShrink: 1,
    paddingRight: space[3],
  },
  statValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingM,
  },
  factLink: {
    marginTop: space[2],
  },
  factLinkText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textLink,
    textDecorationLine: 'underline',
  },
  heartCard: {
    width: '100%',
    backgroundColor: colors.surfaceSunken,
    borderLeftWidth: 3,
    borderLeftColor: colors.brandPrimary,
  },
  heartText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    lineHeight: leading(1.5, fontSize.bodyS),
    marginBottom: space[3],
  },
  storyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textPrimary,
    lineHeight: leading(1.6, fontSize.bodyM),
    marginBottom: space[6],
  },
  buttonGroup: {
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[6],
    gap: space[3],
  },
});
