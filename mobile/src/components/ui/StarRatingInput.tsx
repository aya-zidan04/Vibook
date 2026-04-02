import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { formatIntForLocale } from '@/utils/format';
import { useUserListingRating, type RatingVertical } from '@/services/ratings';
import { ltrNavigationChrome } from '@/utils/navigationChrome';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const STARS = [1, 2, 3, 4, 5] as const;

type StarRatingInputProps = {
  /** 0 = not rated */
  value: number;
  onChange: (stars: number) => void;
  starSize?: number;
};

/**
 * Tappable 1–5 stars. Star row stays LTR so order matches “tap 5th = 5 stars”.
 */
export function StarRatingInput({ value, onChange, starSize = 32 }: StarRatingInputProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors, starSize), [colors, starSize]);
  const { t, locale } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={[ltrNavigationChrome, styles.starRow]}>
        {STARS.map((i) => (
          <Pressable
            key={i}
            onPress={() => onChange(i)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`${formatIntForLocale(i, locale)} ${t('rating.ofFive')}`}
            accessibilityState={{ selected: value >= i }}
          >
            <Ionicons
              name={value >= i ? 'star' : 'star-outline'}
              size={starSize}
              color={value >= i ? colors.warning : colors.textMuted}
            />
          </Pressable>
        ))}
      </View>
      {value > 0 ? (
        <Pressable onPress={() => onChange(0)} hitSlop={8} accessibilityRole="button">
          <AppText variant="meta" color="accent" style={styles.clear}>
            {t('rating.clear')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

type UserRatingBlockProps = {
  vertical: RatingVertical;
  refId: string;
};

/** Uses ratings service (local persist today; API-ready boundary). */
export function UserRatingBlock({ vertical, refId }: UserRatingBlockProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createBlockStyles(colors), [colors]);
  const { t } = useTranslation();
  const { value, setStars } = useUserListingRating(vertical, refId);

  return (
    <View style={styles.card}>
      <AppText variant="bodyMedium" color="text">
        {t('rating.yourRating')}
      </AppText>
      <AppText variant="caption" color="textMuted" style={styles.hint}>
        {t('rating.hint')}
      </AppText>
      <StarRatingInput
        value={value}
        onChange={(n) => setStars(n < 1 ? null : n)}
      />
    </View>
  );
}

function createStyles(_colors: ThemeColors, starSize: number) {
  const gap = Math.max(6, Math.round(starSize * 0.12));
  return StyleSheet.create({
    wrap: { gap: spacing.sm },
    starRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap,
    },
    clear: { alignSelf: 'flex-start', marginTop: 2 },
  });
}

function createBlockStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs,
    },
    hint: { lineHeight: 18, marginBottom: spacing.xs },
  });
}
