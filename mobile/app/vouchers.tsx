import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { DetailHeader } from '@/components/layout/DetailHeader';
import { Screen } from '@/components/layout/Screen';
import { MOCK_VOUCHERS } from '@/mock';
import { colors, radii, spacing } from '@/theme';

export default function VouchersScreen() {
  return (
    <Screen scroll contentStyle={styles.pad}>
      <DetailHeader title="Vouchers" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_VOUCHERS.map((v) => (
          <View key={v.id} style={styles.card}>
            <AppText variant="meta" color="accent">
              {v.code}
            </AppText>
            <AppText variant="h3" color="text" numberOfLines={2}>
              {v.title}
            </AppText>
            <AppText variant="caption" color="textMuted">
              Exp. {v.expiresAt.slice(0, 10)}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md },
  card: {
    width: 220,
    marginRight: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    marginBottom: spacing.lg,
  },
});
