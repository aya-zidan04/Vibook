import { StyleSheet } from 'react-native';
import { premiumSheetTokens as t } from '@/components/sheet/premiumSheetTokens';
import { createShadows, radii, spacing } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export function createPremiumSheetStyles(colors: ThemeColors) {
  const shadows = createShadows(colors);
  const isLight = colors.bgRgb.r > 200;

  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
      ...(isLight ? shadows.sm : shadows.md),
    },
    cardAccent: {
      borderColor: colors.accentBorder,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: t.rowMinHeight,
      paddingHorizontal: t.rowPaddingH,
      paddingVertical: spacing.md,
      gap: spacing.md,
      backgroundColor: colors.card,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowPressed: { opacity: 0.9 },
    rowSelected: {
      backgroundColor: colors.iconContainerBg,
    },
    rowAccentSelected: {
      backgroundColor: colors.accentMuted,
    },
    iconCircle: {
      width: t.iconCircleSize,
      height: t.iconCircleSize,
      borderRadius: t.iconCircleRadius,
      backgroundColor: colors.iconContainerBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    iconCircleAccent: {
      backgroundColor: colors.accentLight,
    },
    rowBody: {
      flex: 1,
      gap: 3,
      minWidth: 0,
      justifyContent: 'center',
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexShrink: 0,
    },
    footnote: {
      marginTop: spacing.lg,
      lineHeight: 20,
    },
    sectionGap: {
      gap: t.contentGap,
    },
    insetCard: {
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: spacing.lg,
      ...(isLight ? shadows.sm : shadows.md),
    },
    sheetButton: {
      borderRadius: t.buttonRadius,
      minHeight: t.buttonMinHeight,
      ...shadows.sm,
    },
    sheetButtonSecondary: {
      borderRadius: t.buttonRadius,
      minHeight: t.buttonMinHeight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      ...shadows.sm,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: radii.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: 14,
      color: colors.text,
      backgroundColor: colors.backgroundElevated,
      fontSize: 16,
    },
    horizontalCards: {
      gap: spacing.md,
      paddingBottom: spacing.xs,
    },
    voucherCard: {
      width: 220,
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: 8,
      ...(isLight ? shadows.sm : shadows.md),
    },
    paymentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...shadows.sm,
    },
    hero: {
      padding: spacing.xl,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      gap: spacing.sm,
      overflow: 'hidden',
      ...shadows.sm,
    },
    billingChip: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: t.buttonRadius,
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    billingChipOn: {
      backgroundColor: colors.iconContainerBg,
      borderColor: colors.primary,
    },
    planCard: {
      padding: spacing.lg,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      gap: spacing.sm,
      ...(isLight ? shadows.sm : shadows.md),
    },
    faqCard: {
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
      ...(isLight ? shadows.sm : shadows.md),
    },
    pickCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: t.rowMinHeight,
      paddingVertical: spacing.md,
      paddingHorizontal: t.rowPaddingH,
      borderRadius: t.cardRadius,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: colors.card,
      borderColor: colors.border,
      ...(isLight ? shadows.sm : shadows.md),
    },
    pickCardSelected: {
      backgroundColor: colors.iconContainerBg,
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    checkCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioEmpty: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      borderColor: colors.borderLight,
    },
  });
}

export function usePremiumSheetStyles(colors: ThemeColors) {
  return createPremiumSheetStyles(colors);
}
