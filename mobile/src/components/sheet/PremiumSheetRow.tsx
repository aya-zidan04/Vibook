import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { NavigationChevronForward } from '@/components/ui/NavigationChevron';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useThemeColors } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconAccent?: boolean;
  onPress?: () => void;
  divider?: boolean;
  selected?: boolean;
  accentSelected?: boolean;
  trailing?: ReactNode;
  showChevron?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
};

export function PremiumSheetRow({
  title,
  subtitle,
  icon,
  iconAccent,
  onPress,
  divider,
  selected,
  accentSelected,
  trailing,
  showChevron = true,
  accessibilityLabel,
  children,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);

  const iconNode = icon;

  const defaultTrailing =
    onPress && showChevron && !trailing ? (
      <NavigationChevronForward size={20} color={colors.chevron} />
    ) : null;

  const body = children ?? (
    <>
      <AppText variant="body-em" color={accentSelected ? 'accent' : 'text'}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="caption" color="rowDescription" numberOfLines={2}>
          {subtitle}
        </AppText>
      ) : null}
    </>
  );

  const rowStyle = [
    styles.row,
    divider && styles.rowDivider,
    selected && styles.rowSelected,
    accentSelected && styles.rowAccentSelected,
  ];

  const content = (
    <>
      {iconNode ? (
        <View style={[styles.iconCircle, (iconAccent || accentSelected) && styles.iconCircleAccent]}>{iconNode}</View>
      ) : null}
      <View style={styles.rowBody}>{body}</View>
      <View style={styles.trailing}>{trailing ?? defaultTrailing}</View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        style={({ pressed }) => [rowStyle, pressed && styles.rowPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={rowStyle}>{content}</View>;
}
