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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBackground } from '@/components/ui/AppBackground';
import { AppText } from '@/components/ui/AppText';
import { NavigationChevronBack } from '@/components/ui/NavigationChevron';
import { premiumSheetTokens as t } from '@/components/sheet/premiumSheetTokens';
import { useTranslation } from '@/i18n/useTranslation';
import { navigationRowStyle } from '@/utils/rtl';
import { spacing, useThemeColors } from '@/theme';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void;
  title?: string;
  contentStyle?: ViewStyle;
  /** Auth/login: no title row, close only on the leading side. */
  authMode?: boolean;
};

export function PremiumSheetLayout({
  children,
  onClose,
  onBack,
  title,
  contentStyle,
  authMode = false,
}: Props) {
  const colors = useThemeColors();
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const insets = useSafeAreaInsets();
  const { t: tr, isRTL } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, Math.max(insets.bottom, spacing.lg), isLight),
    [colors, insets.bottom, isLight],
  );

  return (
    <AppBackground>
      <View style={styles.root}>
        <Pressable
          style={styles.backdropPress}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={tr('common.a11yClose')}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={isLight ? 18 : 10} tint={isLight ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={[StyleSheet.absoluteFill, styles.dim]} />
        </Pressable>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          pointerEvents="box-none"
        >
          <View style={styles.sheet}>
          <View style={styles.grabber} accessibilityLabel={tr('common.a11ySheetHandle')} />

          <View style={[navigationRowStyle(isRTL), styles.toolbar]}>
            {authMode ? (
              <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={12} accessibilityRole="button" accessibilityLabel={tr('common.a11yClose')}>
                <Ionicons name="close" size={28} color={colors.icon} />
              </Pressable>
            ) : (
              <>
                {onBack ? (
                  <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={12} accessibilityRole="button" accessibilityLabel={tr('common.a11yGoBack')}>
                    <NavigationChevronBack size={28} color={colors.icon} />
                  </Pressable>
                ) : (
                  <View style={styles.iconBtnSpacer} />
                )}
                {title ? (
                  <AppText variant="h2" color="text" numberOfLines={1} style={styles.toolbarTitle}>
                    {title}
                  </AppText>
                ) : (
                  <View style={styles.toolbarTitle} />
                )}
                <View style={styles.iconBtnSpacer} />
              </>
            )}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.scroll, contentStyle]}
            bounces={false}
          >
            {children}
          </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </AppBackground>
  );
}

function createStyles(colors: ThemeColors, bottomPad: number, isLight: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdropPress: {
      ...StyleSheet.absoluteFillObject,
    },
    dim: {
      backgroundColor: colors.overlayLight,
    },
    keyboard: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      minHeight: t.sheetMinHeightPct,
      maxHeight: t.sheetMaxHeightPct,
      borderTopLeftRadius: t.sheetTopRadius,
      borderTopRightRadius: t.sheetTopRadius,
      backgroundColor: colors.sheetSurface,
      paddingTop: spacing.sm,
      paddingBottom: bottomPad,
      borderWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: 0,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: isLight ? 0.12 : 0.45,
      shadowRadius: 24,
      elevation: 16,
    },
    grabber: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderLight,
      alignSelf: 'center',
      marginBottom: spacing.sm,
      opacity: 0.85,
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.screen,
      marginBottom: spacing.md,
      minHeight: 40,
    },
    iconBtn: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnSpacer: {
      width: 40,
    },
    toolbarTitle: {
      flex: 1,
      textAlign: 'center',
    },
    scroll: {
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.lg,
      gap: t.contentGap,
    },
  });
}
