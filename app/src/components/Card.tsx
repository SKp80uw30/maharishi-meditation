import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, space } from '../theme/spacing';
import { shadow } from '../theme/effects';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
};

/** White surface card: radius-l, shadow-m — used for the intention card, duration
 * tiles' container-level siblings, stat rows, and About's info cards. */
export default function Card({ children, style, padding = space[6] }: Props) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.l,
    boxShadow: shadow.m,
  },
});
