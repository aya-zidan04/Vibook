import { useMemo } from 'react';
import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import {
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type DimensionValue,
} from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { createShadows, spacing, useThemeColors } from '@/theme';

/** Keep low so partner tabs fit on narrow widths without horizontal scroll. */
const MIN_TAB_WIDTH = 52;

function roundLayout(n: number) {
  return PixelRatio.roundToNearestPixel(n);
}

function isTabBarItemHidden(options: BottomTabNavigationOptions): boolean {
  return (options as { href?: string | null }).href === null;
}

export function BusinessTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const colors = useThemeColors();
  const sh = useMemo(() => createShadows(colors), [colors]);
  const styles = useMemo(() => createBarStyles(), []);
  const { width: windowWidth } = useWindowDimensions();

  const routes = state.routes.filter((route) => !isTabBarItemHidden(descriptors[route.key].options));
  const count = routes.length;
  const barWidth = roundLayout(windowWidth);
  const slotWidth = count > 0 ? barWidth / count : barWidth;
  const useScroll = count > 0 && slotWidth < MIN_TAB_WIDTH;
  const pctWidth: DimensionValue =
    count > 0 ? (`${100 / count}%` as DimensionValue) : ('100%' as DimensionValue);

  const renderTab = (route: (typeof routes)[number], visibleIndex: number) => {
    const routeIndexInState = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === routeIndexInState;
    const { options } = descriptors[route.key];
    const active = options.tabBarActiveTintColor ?? colors.accent;
    const inactive = options.tabBarInactiveTintColor ?? colors.textMuted;
    const tint = focused ? active : inactive;
    const icon =
      options.tabBarIcon?.({
        focused,
        color: tint,
        size: 24,
      }) ?? null;
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : typeof options.title === 'string'
          ? options.title
          : route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.dispatch({
          ...CommonActions.navigate({ name: route.name, params: route.params }),
          target: state.key,
        });
      }
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={
          options.tabBarAccessibilityLabel ?? `${label}, tab ${visibleIndex + 1} of ${count}`
        }
        onPress={onPress}
        style={({ pressed }) => [
          styles.cell,
          useScroll
            ? { width: MIN_TAB_WIDTH, minWidth: MIN_TAB_WIDTH, maxWidth: MIN_TAB_WIDTH }
            : { width: pctWidth },
          pressed && styles.cellPressed,
        ]}
      >
        <View style={styles.iconSlot}>{icon}</View>
        <AppText variant="meta" numberOfLines={1} ellipsizeMode="tail" style={[styles.label, { color: tint }]}>
          {label}
        </AppText>
      </Pressable>
    );
  };

  const row = (
    <View style={[styles.row, styles.rowFill, { direction: 'ltr' }]}>
      {routes.map((route, index) => renderTab(route, index))}
    </View>
  );

  return (
    <View
      style={[
        styles.wrap,
        sh.tabBar,
        {
          width: '100%',
          alignSelf: 'stretch',
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
          direction: 'ltr',
        },
      ]}
    >
      {useScroll ? (
        <ScrollView
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator
          keyboardShouldPersistTaps="handled"
          style={styles.hScroll}
          contentContainerStyle={[styles.hScrollContent, { direction: 'ltr' }]}
        >
          {routes.map((route, index) => renderTab(route, index))}
        </ScrollView>
      ) : (
        row
      )}
    </View>
  );
}

function createBarStyles() {
  return StyleSheet.create({
    wrap: {
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingTop: spacing.sm,
    },
    hScroll: { width: '100%' },
    hScrollContent: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: 54,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      minHeight: 54,
    },
    rowFill: {
      width: '100%',
      alignSelf: 'stretch',
    },
    cell: {
      flexGrow: 0,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 1,
      paddingVertical: 4,
      gap: 3,
    },
    cellPressed: { opacity: 0.88 },
    iconSlot: { height: 26, alignItems: 'center', justifyContent: 'center' },
    label: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.02,
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 0,
    },
  });
}
