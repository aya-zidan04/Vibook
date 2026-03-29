import { useRoute } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { AppText, Screen } from '../../components';
import { spacing } from '../../theme';

export function PlaceholderTabScreen() {
  const params = useRoute().params as { title?: string } | undefined;
  const title = params?.title ?? 'Screen';

  return (
    <Screen scroll>
      <View style={styles.center}>
        <AppText variant="title" color="text">
          {title}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.sub}>
          This section will be implemented next.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  sub: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
