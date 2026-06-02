import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { createShadows, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

export function useSettingsGroupStyles() {
  const colors = useThemeColors();
  return useMemo(() => createGroupStyles(colors), [colors]);
}

function createGroupStyles(colors: ThemeColors) {
  const shadows = createShadows(colors);
  const isLight = colors.bgRgb.r > 200;
  return StyleSheet.create({
    group: {
      backgroundColor: colors.card,
      borderRadius: radii.xl,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      overflow: 'hidden',
      ...(isLight ? shadows.sm : shadows.md),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 14,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.card,
    },
    rowDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowPressed: { opacity: 0.88 },
    rowSelected: {
      backgroundColor: colors.iconContainerBg,
    },
    rowAccentSelected: {
      backgroundColor: colors.accentMuted,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.iconContainerBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    iconAccent: {
      backgroundColor: colors.accentLight,
    },
    rowContent: {
      flex: 1,
      gap: 2,
      minWidth: 0,
    },
    rowLabel: { flex: 1 },
    trailing: { flexShrink: 0 },
  });
}

type GroupProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accentBorder?: boolean;
};

export function SettingsGroupCard({ children, style, accentBorder }: GroupProps) {
  const styles = useSettingsGroupStyles();
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.group,
        accentBorder ? { borderColor: colors.accentBorder } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

type RowProps = {
  onPress?: () => void;
  divider?: boolean;
  selected?: boolean;
  accentSelected?: boolean;
  iconAccent?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  trailing?: ReactNode;
  accessibilityLabel?: string;
};

export function SettingsGroupRow({
  onPress,
  divider,
  selected,
  accentSelected,
  iconAccent,
  icon,
  children,
  trailing,
  accessibilityLabel,
}: RowProps) {
  const styles = useSettingsGroupStyles();
  const body = (
    <>
      {icon ? (
        <View style={[styles.icon, (iconAccent || accentSelected) && styles.iconAccent]}>{icon}</View>
      ) : null}
      <View style={styles.rowContent}>{children}</View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  const rowStyle = [
    styles.row,
    divider && styles.rowDivider,
    selected && styles.rowSelected,
    accentSelected && styles.rowAccentSelected,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{body}</View>;
}
