import React, { Dispatch, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { BlobMark, Button, Card, ScreenContainer } from '../components';
import { WorldPeaceApiClient, WorldPeaceStats, worldPeaceApi } from '../api/worldPeace';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { space } from '../theme/spacing';

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
      }
    })();
    return () => {
      cancelled = true;
    };
    // Deliberately once per mount (arrival at Stats), not per apiClient identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOpen = state.duration === 'open';
  const thanksLine = isOpen ? 'your session' : `your ${state.duration} minutes`;

  return (
    <ScreenContainer style={styles.container} testID="screen-stats">
      <BlobMark size={64} glow={false} />
      <Text style={styles.heading}>Session complete</Text>
      <Text style={styles.supporting}>
        Thank you for {thanksLine}. Others were meditating alongside you at the same time.
      </Text>

      <View style={styles.stats}>
        <StatRow label="World Peace meditations today" value={stats?.total_today} valueColor={colors.brandPrimary} />
        <StatRow label="All time" value={stats?.total_all_time} valueColor={colors.textPrimary} />
      </View>

      <Button label="Meditate again" onPress={() => dispatch({ type: 'RESTART' })} fullWidth style={styles.cta} />
    </ScreenContainer>
  );
}

function StatRow({ label, value, valueColor }: { label: string; value: number | undefined; valueColor: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value != null ? value.toLocaleString() : '—'}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: space[8],
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[10],
    gap: space[5],
  },
  heading: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingL,
    color: colors.textPrimary,
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
  cta: {
    marginTop: 'auto',
  },
});
