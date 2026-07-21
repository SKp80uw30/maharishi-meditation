import React, { Dispatch } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppAction } from '../state/appReducer';
import { BackButton, Button, Card, ScreenContainer } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';

// design_handoff_world_peace_mvp/components/IntentionScreen.jsx +
// README "2. World Peace intention confirmation" — the emotional anchor of the
// MVP: confirms the one fixed intention, doesn't ask the user to choose.
export default function IntentionScreen({ dispatch }: { dispatch: Dispatch<AppAction> }) {
  return (
    <ScreenContainer style={styles.container} testID="screen-intention">
      <BackButton onPress={() => dispatch({ type: 'BACK' })} />

      <View style={styles.middle}>
        <Text style={styles.microLabel}>Today's intention</Text>
        <Text style={styles.headline}>What energy are you{'\n'}sending into the world today?</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>World Peace & Non-violence</Text>
          <Text style={styles.cardBody}>
            Whenever you begin, you meditate alongside others doing the same, right now.
          </Text>
        </Card>
      </View>

      <Button label="Begin your session" onPress={() => dispatch({ type: 'CONTINUE' })} fullWidth />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: space[6] + space[1],
    paddingHorizontal: space[6] + space[1],
    paddingBottom: space[10],
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[5],
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
});
