import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import GradientWash from './GradientWash';

type Props = {
  children: React.ReactNode;
  /** 'light' = cream-50 bg (every screen except Session); 'dark' = ink-900 bg
   * (Session screen only, the app's one dark surface). */
  variant?: 'light' | 'dark';
  /** Which radial wash sits behind the content, if any — 'glow' for light
   * screens, 'duskGlow' for the dark Session screen, undefined for none. */
  wash?: 'glow' | 'duskGlow';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Shared full-screen wrapper: background color, optional radial wash, safe-area
 * insets. Screens compose their own padding/alignment on top via `style`. */
export default function ScreenContainer({ children, variant = 'light', wash, style, testID }: Props) {
  return (
    <SafeAreaView
      testID={testID}
      style={[styles.base, { backgroundColor: variant === 'dark' ? colors.sessionBackground : colors.surfacePage }, style]}
    >
      {wash && <GradientWash kind={wash} />}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
