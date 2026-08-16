import React, { ReactNode } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fontFamily, fontSize, leading, tracking } from '../theme/typography';
import { space } from '../theme/spacing';
import { duration, easing } from '../theme/effects';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  testID?: string;
}

// Minimal bottom sheet using RN's built-in Modal
// Consistent with existing design tokens: easing.outSoft + duration.normal
export default function Sheet({ isOpen, onClose, title, children, testID }: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
      accessibilityLabel={title || 'Sheet dialog'}
    >
      {/* Backdrop */}
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceOverlay }]}
        onPress={onClose}
        accessible={false}
      />

      {/* Sheet container */}
      <View style={[styles.sheetContainer, { height, paddingBottom: insets.bottom }]}>
        <Pressable
          style={[styles.sheet, { maxHeight: height * 0.85 }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{title}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessible
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          <View style={styles.content}>{children}</View>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)',
    paddingTop: space[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space[6],
    paddingBottom: space[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.headingM,
    color: colors.textPrimary,
    lineHeight: leading(1.3, fontSize.headingM),
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: space[6],
    paddingTop: space[4],
    paddingBottom: space[6],
  },
});
