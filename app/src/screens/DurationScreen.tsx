import React, { Dispatch } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppAction, AppState } from '../state/appReducer';
import { BackButton, Button, ScreenContainer } from '../components';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { radius, space } from '../theme/spacing';
import { shadow } from '../theme/effects';

const ROWS: Array<[number, number]> = [
  [3, 5],
  [10, 20],
];

// design_handoff_world_peace_mvp/components/DurationScreen.jsx +
// README "3. Duration selection". Explicit 2×2 rows (rather than a flex-wrap
// grid) give an exact, predictable layout for exactly four fixed options, with
// "Open" spanning full width below.
export default function DurationScreen({
  state,
  dispatch,
}: {
  state: AppState;
  dispatch: Dispatch<AppAction>;
}) {
  const select = (value: number | 'open') => dispatch({ type: 'SELECT_DURATION', duration: value });

  return (
    <ScreenContainer style={styles.container} testID="screen-duration">
      <BackButton onPress={() => dispatch({ type: 'BACK' })} />

      <View style={styles.middle}>
        <Text style={styles.title}>Choose your duration</Text>

        <View style={styles.grid}>
          {ROWS.map((row) => (
            <View key={row.join('-')} style={styles.row}>
              {row.map((minutes) => (
                <DurationTile
                  key={minutes}
                  selected={state.duration === minutes}
                  onPress={() => select(minutes)}
                  label={String(minutes)}
                  caption="minutes"
                  labelSize={fontSize.headingM}
                />
              ))}
            </View>
          ))}
          <DurationTile
            selected={state.duration === 'open'}
            onPress={() => select('open')}
            label="Open"
            caption="meditate as long as you like"
            labelSize={fontSize.bodyL}
            fullWidth
          />
        </View>
      </View>

      <Button
        label="Begin meditation"
        onPress={() => dispatch({ type: 'START_SESSION' })}
        fullWidth
      />
    </ScreenContainer>
  );
}

function DurationTile({
  selected,
  onPress,
  label,
  caption,
  labelSize,
  fullWidth,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  caption: string;
  labelSize: number;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.tile, selected ? styles.tileSelected : styles.tileUnselected, fullWidth && styles.tileFullWidth]}
    >
      <Text style={[styles.tileLabel, { fontSize: labelSize }, selected && styles.tileTextSelected]}>{label}</Text>
      <Text style={[styles.tileCaption, selected && styles.tileTextSelected]}>{caption}</Text>
    </Pressable>
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
    gap: space[8],
    width: '100%',
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.headingL,
    color: colors.textPrimary,
  },
  grid: {
    width: '100%',
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  tile: {
    flex: 1,
    borderRadius: radius.l,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFullWidth: {
    paddingVertical: 18,
  },
  tileUnselected: {
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    backgroundColor: colors.surfaceCard,
    boxShadow: shadow.s,
  },
  tileSelected: {
    backgroundColor: colors.brandPrimary,
    boxShadow: shadow.glowCoral,
  },
  tileLabel: {
    fontFamily: fontFamily.extrabold,
    color: colors.textPrimary,
  },
  tileCaption: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.caption,
    color: colors.textPrimary,
    marginTop: space[1],
  },
  tileTextSelected: {
    color: colors.textOnBrand,
  },
});
