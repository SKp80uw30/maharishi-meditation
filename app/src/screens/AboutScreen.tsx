import React, { Dispatch } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppAction } from '../state/appReducer';
import { BackButton, Card, ScreenContainer } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { space } from '../theme/spacing';

// design_handoff_world_peace_mvp/components/AboutScreen.jsx + README
// "Bonus: About & privacy" — not in the PRD's 5-step flow, but needed for a
// shippable app; reachable via Launch's info affordance (Phase 3), not part of
// the core linear ritual.
export default function AboutScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer style={styles.container} testID="screen-about">
      <BackButton onPress={() => dispatch({ type: 'BACK' })} />

      <View style={styles.body}>
        <Text style={styles.heading}>Privacy, simply</Text>

        <Card style={styles.card}>
          <Text style={styles.paragraph}>No accounts. No location. No personal data, ever.</Text>
          <Text style={styles.paragraph}>
            Each session adds one anonymous count to the shared World Peace total — that's the only
            thing we keep.
          </Text>
        </Card>

        <Card style={styles.cardTight}>
          <Text style={styles.cardTitle}>About the practice</Text>
          <Text style={styles.smallParagraph}>
            Named for the Maharishi Effect — the studied idea that a group meditating on the same
            intention has a measurable collective effect. This app makes that shared field visible,
            one session at a time.
          </Text>
        </Card>
      </View>

      <Text style={styles.footer}>v1.0 · made for a shared field of practice</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space[6] + space[1],
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[10],
  },
  body: {
    gap: space[5],
    marginTop: space[3],
  },
  heading: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingL,
    color: colors.textPrimary,
  },
  card: {
    gap: space[2] + space[1],
  },
  cardTight: {
    gap: space[2],
  },
  paragraph: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  cardTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingS,
    color: colors.textPrimary,
  },
  smallParagraph: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyS,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: fontFamily.regular,
    fontSize: fontSize.caption,
    color: colors.textTertiary,
  },
});
