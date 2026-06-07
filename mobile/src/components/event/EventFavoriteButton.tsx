import { useMemo } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  eventId: string;
  variant?: 'overlay' | 'plain';
  iconColor?: string;
  size?: number;
  style?: ViewStyle;
  onRequiresAuth?: () => void;
};

export function EventFavoriteButton({
  eventId,
  variant = 'overlay',
  iconColor,
  size = 18,
  style,
  onRequiresAuth,
}: Props) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const favKey = `event:${eventId}`;
  const isFav = useFavoritesStore((s) => !!s.keys[favKey]);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const onPress = () => {
    if (!isAuthenticated || !/^\d+$/.test(eventId)) {
      onRequiresAuth?.();
      return;
    }
    void toggleFavorite('event', eventId);
  };

  const iconName = isFav ? 'heart' : 'heart-outline';
  const resolvedColor =
    iconColor ?? (variant === 'plain' ? colors.primary : isFav ? colors.accent : colors.textOnPrimary);

  return (
    <Pressable
      style={({ pressed }) => [
        variant === 'overlay' ? [styles.overlay, isFav && styles.overlayActive] : styles.plain,
        pressed && { opacity: 0.88 },
        style,
      ]}
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={isFav ? t('common.a11yRemoveFavorite') : t('common.a11yAddFavorite')}
    >
      <Ionicons name={iconName} size={size} color={resolvedColor} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.iconOverlay,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlayActive: {
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    plain: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
