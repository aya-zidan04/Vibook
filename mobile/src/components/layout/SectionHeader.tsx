import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, subtitle, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.titles}>
        <AppText variant="h2" color="text">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textSecondary" style={styles.sub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={10}>
          <AppText variant="bodyMedium" color="accent">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingRight: 2,
  },
  titles: {
    flex: 1,
    gap: 4,
  },
  sub: {
    marginTop: 2,
  },
});
