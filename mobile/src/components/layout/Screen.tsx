import { ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderSeparationChrome } from '@/components/layout/HeaderSeparationChrome';
import { spacing } from '@/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  /** Renders above scroll/body content; does not scroll (e.g. `DetailHeader`). */
  header?: ReactNode;
};

export function Screen({
  children,
  scroll = false,
  contentStyle,
  edges = ['top', 'left', 'right'],
  header,
}: Props) {
  const styles = useMemo(() => createStyles(), []);

  const headerBlock =
    header != null ? (
      <HeaderSeparationChrome style={styles.headerChrome}>{header}</HeaderSeparationChrome>
    ) : null;

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        {headerBlock}
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (header != null) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        {headerBlock}
        <View style={[styles.fill, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.fill, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

function createStyles() {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    flex: { flex: 1, backgroundColor: 'transparent' },
    headerChrome: {
      paddingHorizontal: spacing.screen,
      flexShrink: 0,
    },
    fill: {
      flex: 1,
      paddingHorizontal: spacing.screen,
    },
    scrollContent: {
      paddingHorizontal: spacing.screen,
      paddingBottom: spacing.xxxl,
    },
  });
}
