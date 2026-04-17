import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  greeting: string;
  cityLabel: string;
  avatarUrl: string | null;
  onCityPress?: () => void;
  onNotifPress?: () => void;
  onAvatarPress?: () => void;
};

export function AppHeader({
  greeting,
  cityLabel,
  avatarUrl,
  onCityPress,
  onNotifPress,
  onAvatarPress,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <AppText variant="caption" color="textMuted">
          {greeting}
        </AppText>
        <Pressable onPress={onCityPress} style={styles.cityRow} hitSlop={8}>
          <Ionicons name="location" size={16} color={colors.accent} />
          <AppText variant="h3" color="text" numberOfLines={1} style={styles.city}>
            {cityLabel}
          </AppText>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.iconBtn}
          onPress={onNotifPress ?? (() => {})}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.dot} />
        </Pressable>
        <Pressable onPress={onAvatarPress} accessibilityLabel="Profile">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={22} color={colors.textMuted} />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    left: { flex: 1, marginEnd: spacing.md },
    cityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    city: { flexShrink: 1 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      position: 'absolute',
      top: 10,
      end: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.secondary,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: colors.primaryMuted,
    },
    avatarPlaceholder: {
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
