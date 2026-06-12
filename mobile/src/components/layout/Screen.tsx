import { ReactNode, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderSeparationChrome } from '@/components/layout/HeaderSeparationChrome';
import { spacing } from '@/theme';
import { useThemeStore } from '@/store/themeStore';

/** Reserve space until the overlay header reports its height (avoids content underlap on first frame). */
const GLASS_HEADER_FALLBACK = 96;

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
  const isLight = useThemeStore((s) => s.colorScheme) === 'light';
  const useGlassOverlay = isLight && scroll && header != null;
  const [headerHeight, setHeaderHeight] = useState(0);
  const styles = useMemo(() => createStyles(), []);

  const headerChrome = (
    <HeaderSeparationChrome style={styles.headerChrome}>{header}</HeaderSeparationChrome>
  );

  const headerBlock =
    header != null ? (
      useGlassOverlay ? (
        <View
          style={styles.headerOverlay}
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          pointerEvents="box-none"
        >
          {headerChrome}
        </View>
      ) : (
        headerChrome
      )
    ) : null;

  const scrollTopInset = useGlassOverlay
    ? Math.max(headerHeight, GLASS_HEADER_FALLBACK)
    : undefined;

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={edges}>
        <View style={styles.shell}>
          {!useGlassOverlay ? headerBlock : null}
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              contentStyle,
              scrollTopInset != null ? { paddingTop: scrollTopInset } : undefined,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
          {useGlassOverlay ? headerBlock : null}
        </View>
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
    shell: {
      flex: 1,
    },
    flex: { flex: 1, backgroundColor: 'transparent' },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    headerChrome: {
      paddingHorizontal: spacing.screen,
      paddingTop: spacing.sm,
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
