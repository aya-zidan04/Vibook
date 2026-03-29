import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../../theme';

type Props = {
  title: string;
  eyebrow?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({ title, eyebrow, actionLabel, onActionPress }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.titles}>
        {eyebrow ? (
          <AppText variant="overline" color="textMuted" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="subtitle" color="text">
          {title}
        </AppText>
      </View>
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={10} style={styles.actionHit}>
          <AppText variant="bodyMedium" color="primary">
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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
  eyebrow: {
    color: colors.textMuted,
  },
  actionHit: {
    paddingLeft: spacing.sm,
    paddingBottom: 2,
  },
});
