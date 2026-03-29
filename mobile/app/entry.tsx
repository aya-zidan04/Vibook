import { useCallback, useEffect, useRef, useState } from 'react';
import type { ViewToken } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton, SecondaryButton } from '@/components/ui/Button';
import { useTranslation } from '@/i18n/useTranslation';
import { useAppStore } from '@/store/appStore';
import { colors, fadePlum, radii, spacing } from '@/theme';

const AUTO_MS = 4800;

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
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const setHasCompletedOnboarding = useAppStore((s) => s.setHasCompletedOnboarding);
  const setGuest = useAppStore((s) => s.setGuest);

  const listRef = useRef<FlatList>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const userScrolling = useRef(false);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i != null && i !== activeRef.current) {
        activeRef.current = i;
        setActive(i);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 72,
  }).current;

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      const clamped = ((index % SLIDES.length) + SLIDES.length) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: clamped * width, animated });
      activeRef.current = clamped;
      setActive(clamped);
    },
    [width],
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
    const i = Math.round(x / width);
    activeRef.current = i;
    setActive(i);
    setTimeout(() => {
      userScrolling.current = false;
    }, 400);
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    activeRef.current = i;
    setActive(i);
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
      <View style={styles.carousel}>
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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={{ width, height }} contentFit="cover" priority="high" />
          )}
          decelerationRate="fast"
        />
      </View>

      <LinearGradient
        colors={[fadePlum(0.45), fadePlum(0.2), fadePlum(0.65), fadePlum(0.97)]}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <View style={styles.logoRing}>
            <Ionicons name="ticket" size={36} color={colors.primary} />
          </View>
          <AppText variant="display" color="text" style={styles.brand}>
            Vibook
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.tagline}>
            {t('entry.tagline')}
          </AppText>
        </View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <View
                key={s.key}
                style={[styles.dot, i === active ? styles.dotOn : styles.dotOff]}
              />
            ))}
          </View>
          <PrimaryButton title={t('entry.loginSignup')} onPress={goAuth} style={btnShape} />
          <SecondaryButton title={t('entry.browseFirst')} onPress={browseFirst} style={btnShape} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  carousel: { ...StyleSheet.absoluteFillObject },
  carouselList: { flex: 1 },
  safe: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  top: {
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  logoRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brand: { marginBottom: spacing.sm },
  tagline: { textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  bottom: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    gap: spacing.md,
    width: '100%',
  },
  dots: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: { backgroundColor: colors.accent, width: 22 },
  dotOff: { backgroundColor: colors.textMuted, opacity: 0.45 },
});
