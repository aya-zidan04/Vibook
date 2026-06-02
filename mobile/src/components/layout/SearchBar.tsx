import { useMemo } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { createShadows, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type BaseProps = {
  placeholder?: string;
  onFilterPress?: () => void;
};

type ReadonlyProps = BaseProps & {
  editable?: false;
  onPress?: () => void;
};

type EditableProps = BaseProps & {
  editable: true;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
};

type Props = ReadonlyProps | EditableProps;

export function SearchBar(props: Props) {
  const colors = useThemeColors();
  const { t, isRTL } = useTranslation();
  const styles = useMemo(() => createStyles(colors, isRTL), [colors, isRTL]);
  const sh = useMemo(() => createShadows(colors), [colors]);
  const ph = props.placeholder ?? t('search.placeholder');

  const filterBtn = props.onFilterPress ? (
    <Pressable
      onPress={props.onFilterPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('common.filters')}
    >
      <Ionicons name="options-outline" size={20} color={colors.icon} />
    </Pressable>
  ) : (
    <Ionicons name="options-outline" size={20} color={colors.icon} />
  );

  if (props.editable) {
    return (
      <View style={[styles.wrap, sh.sm]}>
        <Ionicons name="search" size={22} color={colors.primary} />
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={ph}
          placeholderTextColor={colors.placeholder}
          autoFocus={props.autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={[styles.input, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}
          accessibilityLabel={t('common.a11ySearch')}
        />
        {filterBtn}
      </View>
    );
  }

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [styles.wrap, sh.sm, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
      accessibilityLabel={t('common.a11ySearch')}
    >
      <Ionicons name="search" size={22} color={colors.primary} />
      <AppText variant="body-em" color="textMuted" style={styles.ph}>
        {ph}
      </AppText>
      {filterBtn}
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, isRTL: boolean) {
  return StyleSheet.create({
    wrap: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.full,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: spacing.lg,
    },
    ph: { flex: 1, textAlign: isRTL ? 'right' : 'left' },
    input: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      paddingVertical: 4,
      minHeight: 28,
    },
  });
}
