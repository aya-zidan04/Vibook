import type { ReactNode } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { colors, spacing } from '@/theme';

type Props = {
  title?: string;
  right?: ReactNode;
};

export function DetailHeader({ title, right }: Props) {
  const router = useRouter();
  const rtl = I18nManager.isRTL;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name={rtl ? 'chevron-forward' : 'chevron-back'} size={28} color={colors.text} />
      </Pressable>
      {title ? (
        <AppText variant="h3" color="text" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
      ) : (
        <View style={styles.spacer} />
      )}
      {right ?? <View style={styles.rightPad} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  title: { flex: 1, textAlign: 'center' },
  spacer: { flex: 1 },
  rightPad: { width: 28 },
});
