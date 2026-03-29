import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/Button';
import { CURRENT_USER, MOCK_BOOKINGS, MOCK_VOUCHERS } from '@/mock';
import { colors, radii, spacing } from '@/theme';
import { formatPrice } from '@/utils/format';

const MENU: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'wallet', label: 'Wallet & credits', icon: 'wallet-outline' },
  { key: 'vouchers', label: 'Vouchers', icon: 'pricetag-outline' },
  { key: 'favorites', label: 'Favorites', icon: 'heart-outline' },
  { key: 'bookings', label: 'All bookings', icon: 'ticket-outline' },
  { key: 'payment', label: 'Payment methods', icon: 'card-outline' },
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline' },
  { key: 'language', label: 'Language & region', icon: 'language-outline' },
  { key: 'help', label: 'Help center', icon: 'help-circle-outline' },
  { key: 'settings', label: 'Settings', icon: 'settings-outline' },
];

export default function ProfileScreen() {
  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'upcoming').length;

  return (
    <Screen scroll contentStyle={styles.pad}>
      <LinearGradient colors={[colors.primaryMuted, 'transparent']} style={styles.header}>
        <Image source={{ uri: CURRENT_USER.avatarUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.headerText}>
          <AppText variant="h1" color="text">
            {CURRENT_USER.name}
          </AppText>
          <View style={styles.badgeRow}>
            <View style={styles.tier}>
              <AppText variant="meta" color="accent">
                {CURRENT_USER.membershipTier.toUpperCase()}
              </AppText>
            </View>
            <AppText variant="caption" color="textSecondary">
              {CURRENT_USER.email}
            </AppText>
          </View>
        </View>
        <PrimaryButton title="Edit profile" onPress={() => {}} style={styles.edit} />
      </LinearGradient>

      <View style={styles.stats}>
        <StatItem label="Bookings" value={String(MOCK_BOOKINGS.length)} icon="calendar-outline" />
        <StatItem label="Upcoming" value={String(upcoming)} icon="time-outline" />
        <StatItem
          label="Wallet"
          value={formatPrice(CURRENT_USER.walletBalance, 'SAR')}
          icon="wallet-outline"
        />
      </View>

      <SectionHeader title="Your vouchers" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {MOCK_VOUCHERS.map((v) => (
          <View key={v.id} style={styles.voucher}>
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

      <SectionHeader title="Account" />
      <View style={styles.menu}>
        {MENU.map((item) => (
          <Pressable key={item.key} style={styles.menuRow}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={colors.primary} />
            </View>
            <AppText variant="bodyMedium" color="text" style={styles.menuLabel}>
              {item.label}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}
        <Pressable style={[styles.menuRow, styles.logout]}>
          <View style={styles.menuIcon}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
          </View>
          <AppText variant="bodyMedium" style={{ color: colors.error }}>
            Log out
          </AppText>
        </Pressable>
      </View>

      <AppText variant="meta" color="textMuted" style={styles.version}>
        Vibook · v1.0.0 · Phase 1
      </AppText>
    </Screen>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <AppText variant="h2" color="text">
        {value}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingTop: spacing.md },
  header: {
    borderRadius: radii.xxl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  headerText: { gap: spacing.xs },
  badgeRow: { gap: 6 },
  tier: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  edit: { marginTop: spacing.lg },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  voucher: {
    width: 200,
    marginRight: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    marginBottom: spacing.lg,
  },
  menu: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1 },
  logout: {
    borderBottomWidth: 0,
    marginTop: spacing.xs,
  },
  version: {
    textAlign: 'center',
    marginBottom: spacing.xxxl,
  },
});
