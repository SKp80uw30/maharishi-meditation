import React, { Dispatch, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Animated, useWindowDimensions } from 'react-native';
import { AppAction } from '../state/appReducer';
import { BackButton, Button, Card, ScreenContainer, StoryOnboarding } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';
import { worldPeaceApi, type WorldPeaceStats } from '../api/worldPeace';
import { narrative } from '../content/story';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useFirstRunStory } from '../hooks/useFirstRunStory';

// Below this width the card stacks its text above the CTA (mobile default);
// at or above it there's room to sit the CTA beside the text instead, so
// the card is designed mobile-first and widens into a row.
const WIDE_BREAKPOINT = 640;
// Caps the card/headline column on wide viewports so a desktop browser
// window doesn't stretch the card edge-to-edge into an unreadable line
// length — the whole reason this screen felt sparse on desktop before.
const CONTENT_MAX_WIDTH = 640;

// design_handoff_world_peace_mvp/components/IntentionScreen.jsx +
// README "2. World Peace intention confirmation" — the emotional anchor of the
// MVP: confirms the one fixed intention, doesn't ask the user to choose. Also
// displays live count of current meditators for social proof.
export default function IntentionScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  const [stats, setStats] = useState<WorldPeaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Only the automatic first-visit route remains here — the on-demand "Go
  // deeper" link was removed from this card (it duplicated Launch's own
  // permanent "Tell me more", which now shows the same origin hook on every
  // launch, not just the first).
  const { isStoryOpen, closeStory } = useFirstRunStory();
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  // null = the API gave no estimate (it's optional in the contract). Both that
  // and a real zero hide the count block: "0 meditators" would contradict the
  // supporting line right next to it, and zero is a routine reading since the
  // active-session set drains after 30 minutes.
  const [displayCount, setDisplayCount] = useState<number | null>(null);
  const [prevCount, setPrevCount] = useState<number | null>(null);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const result = await worldPeaceApi.getStats();
        if (mounted) {
          setStats(result);
          const newCount = result?.current_active_estimate ?? null;

          // Trigger a pulse animation when the count changes
          if (newCount !== prevCount) {
            if (newCount != null && reducedMotion === false) {
              scaleAnim.setValue(1.1);
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
            }
            setPrevCount(newCount);
          }

          setDisplayCount(newCount);
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
  }, [prevCount, scaleAnim, reducedMotion]);

  const activeText = displayCount === 1 ? 'meditator' : 'meditators';

  return (
    <ScreenContainer style={styles.container} testID="screen-intention">
      <BackButton onPress={() => dispatch({ type: 'BACK' })} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator
      >
        <Text style={styles.microLabel}>Today's intention</Text>
        <Text style={styles.headline}>
          What energy are you{'\n'}sending into the world today?
        </Text>

        <Card style={styles.card}>
          <View style={[styles.cardRow, isWide && styles.cardRowWide]}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>World Peace & Non-violence</Text>
              <Text style={styles.cardBody}>{narrative.intentionSupportingLine}</Text>
              {displayCount != null && displayCount > 0 && (
                <View style={styles.liveRow}>
                  <Animated.Text
                    style={[styles.liveNumber, { transform: [{ scale: scaleAnim }] }]}
                  >
                    {displayCount}
                  </Animated.Text>
                  <Text style={styles.liveLabel}>{activeText}</Text>
                  <Text style={styles.liveCaption}> meditating right now</Text>
                </View>
              )}
            </View>
            <Button
              label="Begin your session"
              onPress={() => dispatch({ type: 'CONTINUE' })}
              fullWidth={!isWide}
              style={isWide ? styles.ctaWide : styles.ctaNarrow}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Story onboarding: automatic on a first visit only — the on-demand
       * route now lives solely on Launch's "Tell me more". */}
      <StoryOnboarding isOpen={isStoryOpen} onClose={closeStory} />
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
  scrollContentWide: {
    maxWidth: CONTENT_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
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
    letterSpacing: tracking(0.015, 26),
    lineHeight: leading(1.3, 26),
    textAlign: 'center',
  },
  card: {
    width: '100%',
    gap: space[2],
    backgroundColor: 'rgba(255, 125, 92, 0.04)',
    borderLeftWidth: 3,
    borderLeftColor: colors.brandPrimary,
  },
  // Mobile-first: stacked text above a full-width CTA by default. At
  // WIDE_BREAKPOINT the card switches to a row so the CTA sits beside the
  // text instead of below it, using the extra horizontal room desktop has.
  cardRow: {
    flexDirection: 'column',
    gap: space[4],
  },
  cardRowWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[6],
  },
  cardText: {
    flex: 1,
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
    marginTop: space[1],
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: space[3],
  },
  liveNumber: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.bodyM,
    color: colors.brandPrimary,
  },
  liveLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    color: colors.brandPrimary,
    marginLeft: space[1],
  },
  liveCaption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
  ctaNarrow: {
    marginTop: space[1],
  },
  ctaWide: {
    flexShrink: 0,
  },
});
