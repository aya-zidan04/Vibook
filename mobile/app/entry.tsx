import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TextStyle,
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
import { fadeFromBackground, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';
import { fontFamilyForWeight, type AppLocaleFont } from '@/theme/typography';

/** Time between automatic slide advances (manual swipe still uses native momentum). */
const AUTO_MS = 3800;

const SLIDES = [
  { key: 'welcome-01', source: require('../assets/entry/entry_welcome_01.png') },
  { key: 'welcome-02', source: require('../assets/entry/entry_welcome_02.png') },
  { key: 'welcome-03', source: require('../assets/entry/entry_welcome_03.png') },
] as const;

const HERO_HEADLINE_MAX = 52;
const HERO_HEADLINE_MIN = 44;

const heroTextShadow: TextStyle = {
  textShadowColor: 'rgba(0, 0, 0, 0.42)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 10,
};

/** Scale headline so each line stays on one row (no third-line wrap on narrow widths). */
function entryHeadlineFontSize(windowWidth: number): number {
  const inner = windowWidth - spacing.screen * 2;
  const scaled = Math.floor(inner / 7.1);
  return Math.min(HERO_HEADLINE_MAX, Math.max(HERO_HEADLINE_MIN, scaled));
}

/** Two-line headline block — one sentence, equal weight per line. */
function entryHeroHeadlineStyle(locale: AppLocaleFont, isRTL: boolean, fontSize: number): TextStyle {
  const direction: TextStyle = isRTL ? { writingDirection: 'rtl' } : { writingDirection: 'ltr' };
  return {
    width: '100%',
    maxWidth: '100%',
    textAlign: 'center',
    fontSize,
    fontWeight: '800',
    fontFamily: fontFamilyForWeight(locale, '800'),
    lineHeight: Math.round(fontSize * 1.05),
    letterSpacing: -0.4,
    color: '#FFFFFF',
    ...heroTextShadow,
    ...direction,
  };
}

export default function AppEntryScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t, isRTL, locale } = useTranslation();
  const headlineSize = useMemo(() => entryHeadlineFontSize(winW), [winW]);
  const headlineStyle = useMemo(
    () => entryHeroHeadlineStyle(locale, isRTL, headlineSize),
    [locale, isRTL, headlineSize],
  );

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

  const btnShape = { width: '100%' as const };

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
              source={item.source}
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
        locations={[0, 0.32, 0.68, 1]}
        style={[StyleSheet.absoluteFill, bleedStyle]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topSpacer} />

        <View style={styles.bottom}>
          <View style={styles.heroBlock}>
            <View style={styles.heroHeadlineBlock}>
              <AppText
                style={headlineStyle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                maxFontSizeMultiplier={1}
              >
                {t('entry.titleLine1')}
              </AppText>
              <AppText
                style={headlineStyle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
                maxFontSizeMultiplier={1}
              >
                {t('entry.titleLine2')}
              </AppText>
            </View>
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
    root: { flex: 1, backgroundColor: 'transparent' },
    carousel: {},
    carouselList: { flex: 1 },
    safe: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'column',
    },
    topSpacer: { flex: 1, minHeight: 0 },
    heroBlock: {
      width: '100%',
      maxWidth: '100%',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 80,
      marginBottom: spacing.md,
    },
    heroHeadlineBlock: {
      width: '100%',
      alignItems: 'center',
      gap: 2,
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
