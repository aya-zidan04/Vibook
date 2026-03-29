import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: Props) {
  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.fill, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl + spacing.md,
  },
});
