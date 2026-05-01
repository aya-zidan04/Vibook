import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { fadeFromBackground, radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

/** Time between automatic slide advances (manual swipe still uses native momentum). */
const AUTO_MS = 3800;

const SLIDES = [
  {
    key: 'events',
    uri: 'https://images.unsplash.com/photo-1540039155733-5bb30b53a388?w=1400&q=85&auto=format&fit=crop',
  },
  {
    key: 'restaurants',
    uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85&auto=format&fit=crop',
  },
  {
    key: 'travel',
    uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1400&q=85&auto=format&fit=crop',
  },
  {
    key: 'experiences',
    uri: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=1400&q=85&auto=format&fit=crop',
  },
];

export default function AppEntryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t, isRTL } = useTranslation();

  /** Full physical page size so photos bleed behind status bar + home indicator. */
  const pageW = winW + insets.left + insets.right;
  const pageH = winH + insets.top + insets.bottom;
  const bleedStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      top: -insets.top,
      bottom: -insets.bottom,
      left: -insets.left,
      right: -insets.right,
    }),
    [insets.top, insets.bottom, insets.left, insets.right],
  );
  const setHasCompletedOnboarding = useAppStore((s) => s.setHasCompletedOnboarding);
  const setGuest = useAppStore((s) => s.setGuest);

  const listRef = useRef<FlatList>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const activeRef = useRef(0);
  const userScrolling = useRef(false);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      const clamped = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: clamped * pageW, animated });
      activeRef.current = clamped;
    },
    [pageW],
  );

  useEffect(() => {
    if (!layoutReady) return;
    const id = setInterval(() => {
      if (userScrolling.current) return;
      const next = (activeRef.current + 1) % SLIDES.length;
      scrollToIndex(next, true);
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [layoutReady, scrollToIndex]);

  const onScrollBeginDrag = () => {
    userScrolling.current = true;
  };

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / pageW);
    activeRef.current = i;
    setTimeout(() => {
      userScrolling.current = false;
    }, 400);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / pageW);
    activeRef.current = i;
    userScrolling.current = false;
  };

  const browseFirst = () => {
    setGuest(true);
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)/explore');
  };

  const goAuth = () => {
    router.push('/login');
  };

  const btnShape = { borderRadius: radii.lg, width: '100%' as const };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.carousel, bleedStyle]}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.carouselList}
          onLayout={() => setLayoutReady(true)}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: pageW,
            offset: pageW * index,
            index,
          })}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.uri }}
              style={{ width: pageW, height: pageH }}
              contentFit="cover"
              priority="high"
            />
          )}
          decelerationRate="fast"
        />
      </View>

      <LinearGradient
        colors={[
          fadeFromBackground(colors, 0.45),
          fadeFromBackground(colors, 0.2),
          fadeFromBackground(colors, 0.65),
          fadeFromBackground(colors, 0.97),
        ]}
        locations={[0, 0.35, 0.72, 1]}
        style={[StyleSheet.absoluteFill, bleedStyle]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topSpacer} />

        <View style={styles.bottom}>
          <View style={[styles.brandBlock, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
            <AppText
              variant="display"
              color="textSecondary"
              style={[styles.tagline, { textAlign: isRTL ? 'right' : 'left' }]}
            >
              {t('entry.tagline')}
            </AppText>
          </View>
          <PrimaryButton title={t('entry.loginSignup')} onPress={goAuth} style={btnShape} />
          <SecondaryButton title={t('entry.browseFirst')} onPress={browseFirst} style={btnShape} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  /** Position + outsets applied in JSX via `bleedStyle` for edge-to-edge photos. */
  carousel: {},
  carouselList: { flex: 1 },
  safe: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  /** Fills space so headline + controls sit at the bottom of the screen. */
  topSpacer: { flex: 1, minHeight: 0 },
  brandBlock: {
    alignItems: 'flex-start',
    width: '100%',
  },
  /** Hero headline — intentionally large for the welcome screen. */
  tagline: {
    width: '100%',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.6,
  },
  bottom: {
    flexShrink: 0,
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    gap: spacing.md,
    width: '100%',
  },
  });
}
