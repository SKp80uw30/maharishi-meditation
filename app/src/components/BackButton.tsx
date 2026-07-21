import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';
import { fontSize } from '../theme/typography';

/** The "←" back arrow shared by Intention, Duration, and About — per the design
 * README, a plain text glyph, not an icon library (Phosphor Icons are flagged as
 * a placeholder pending real brand iconography; this glyph avoids needing one
 * for MVP). */
export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Back" style={styles.button} hitSlop={12}>
      <Text style={styles.glyph}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
  },
  glyph: {
    fontSize: fontSize.headingM,
    color: colors.textTertiary,
  },
});
