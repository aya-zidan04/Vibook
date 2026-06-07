import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { useTranslation } from '@/i18n/useTranslation';
import { useBusinessHubStore } from '@/store/businessHubStore';
import { partnerGateMessageKey } from '@/utils/businessPartnerAccess';
import { radii, spacing, useThemeColors } from '@/theme';

export function BusinessPartnerGateBanner() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const apiProfileStatus = useBusinessHubStore((s) => s.apiProfileStatus);
  const requiresReApproval = useBusinessHubStore((s) => s.requiresReApproval);
  const previouslyApproved = useBusinessHubStore((s) => s.previouslyApproved);

  const messageKey = useMemo(
    () => partnerGateMessageKey(apiProfileStatus, requiresReApproval, previouslyApproved),
    [apiProfileStatus, requiresReApproval, previouslyApproved],
  );

  if (!messageKey) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          borderColor: colors.accentBorder,
          backgroundColor: colors.primaryMuted,
        },
      ]}
    >
      <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
      <AppText variant="caption" color="textSecondary" style={styles.text}>
        {t(messageKey)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    lineHeight: 18,
  },
});
