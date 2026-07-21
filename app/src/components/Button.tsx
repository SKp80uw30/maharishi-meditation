import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { fontFamily, fontSize } from '../theme/typography';
import { radius, space } from '../theme/spacing';
import { shadow } from '../theme/effects';

type Variant = 'primary' | 'outline';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Pill CTA button. `primary` = filled brand-coral with the glow shadow (Launch,
 * Intention, Duration, Stats). `outline` = transparent with a translucent white
 * border, used only on the dark Session screen ("End early"/"End session"). */
export default function Button({ label, onPress, variant = 'primary', fullWidth, style, testID }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        fullWidth && styles.fullWidth,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text style={isPrimary ? styles.primaryLabel : styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: space[4],
    paddingHorizontal: space[10],
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
    paddingHorizontal: space[4],
  },
  primary: {
    backgroundColor: colors.brandPrimary,
    boxShadow: shadow.glowCoral,
  },
  primaryLabel: {
    color: colors.textOnBrand,
    fontFamily: fontFamily.bold,
    fontSize: 17,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingVertical: space[3] - 2,
    paddingHorizontal: space[6],
  },
  outlineLabel: {
    color: colors.sessionTextSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
  },
});
