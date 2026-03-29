import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { SecondaryButton } from '@/components/ui/Button';
import { spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'Check your connection and try again.',
  onRetry,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(), []);

  return (
    <View style={styles.wrap}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.error} />
      <AppText variant="h3" color="text" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="body" color="textSecondary" style={styles.msg}>
        {message}
      </AppText>
      {onRetry ? (
        <SecondaryButton title="Try again" onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.xxl,
    },
    title: { marginTop: spacing.md, textAlign: 'center' },
    msg: { marginTop: spacing.sm, textAlign: 'center', lineHeight: 22 },
    btn: { marginTop: spacing.lg, alignSelf: 'stretch' },
  });
}
