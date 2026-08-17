import React, { useEffect, useState } from 'react';
import { Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = {
  value: number | string;
  suffix?: string;
  label: string;
  isNegative?: boolean; // For showing -16%
};

/**
 * Animates a number counter with spring scale effect.
 * Used in Beat 2 to celebrate the discovery of crime reduction statistics.
 */
export default function AnimatedCounter({ value, suffix = '', label, isNegative = false }: Props) {
  const [scaleAnim] = useState(new Animated.Value(0));
  const reducedMotion = useReducedMotion();
  const displayValue = typeof value === 'string' ? parseInt(value, 10) : value;
  const sign = isNegative ? '-' : '';

  useEffect(() => {
    if (reducedMotion === null) return;
    if (reducedMotion) {
      scaleAnim.setValue(1);
      return;
    }
    // Spring scale-in animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 8,
      bounciness: 3,
    }).start();

    return () => {
      scaleAnim.setValue(0);
    };
  }, [scaleAnim, reducedMotion]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.value}>
        {sign}{displayValue}{suffix}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  value: {
    fontFamily: fontFamily.extrabold,
    fontSize: 72,
    color: colors.brandPrimary,
    lineHeight: 80,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyM,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
});
