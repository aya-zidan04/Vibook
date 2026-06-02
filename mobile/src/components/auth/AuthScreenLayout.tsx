import { ReactNode, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n/useTranslation';
import { NavigationChevronBack } from '@/components/ui/NavigationChevron';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { navigationRowStyle } from '@/utils/rtl';

type Props = {
  children: ReactNode;
  /** Leading control — signup → login */
  onBack?: () => void;
  /** Trailing/leading close — login → entry */
  onClose?: () => void;
  contentStyle?: ViewStyle;
};

/**
 * Full-screen auth shell (login + signup).
 * One screen, one form — no bottom sheet, no stacked modals.
 */
export function AuthScreenLayout({ children, onBack, onClose, contentStyle }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, Math.max(insets.bottom, spacing.lg)),
    [colors, insets.bottom],
  );

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <View style={[navigationRowStyle(isRTL), styles.toolbar]}>
            {onBack ? (
              <Pressable
                onPress={onBack}
                style={styles.iconBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('common.a11yGoBack')}
              >
                <NavigationChevronBack size={28} color={colors.icon} />
              </Pressable>
            ) : onClose ? (
              <Pressable
                onPress={onClose}
                style={styles.iconBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('common.a11yClose')}
              >
                <Ionicons name="close" size={28} color={colors.text} />
              </Pressable>
            ) : (
              <View style={styles.iconBtn} />
            )}

            {onBack && onClose ? (
              <Pressable
                onPress={onClose}
                style={styles.iconBtn}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('common.a11yClose')}
              >
                <Ionicons name="close" size={28} color={colors.icon} />
              </Pressable>
            ) : (
              <View style={styles.iconBtn} />
            )}
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scroll, contentStyle]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            bounces
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: ThemeColors, bottomPad: number) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    flex: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.sm,
      minHeight: 44,
    },
    iconBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: {
      flexGrow: 1,
      paddingHorizontal: spacing.screen,
      paddingBottom: bottomPad,
      gap: spacing.md,
    },
  });
}
