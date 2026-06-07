import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/ui/AppText';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  photos: string[];
  height?: number;
  style?: ViewStyle;
};

const DEFAULT_HEIGHT = 280;

export function EventPhotoGallery({ photos, height = DEFAULT_HEIGHT, style }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors, height), [colors, height]);
  const width = Dimensions.get('window').width;
  const [index, setIndex] = useState(0);

  const slides = photos.length > 0 ? photos : [];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    setIndex(Math.min(Math.max(i, 0), Math.max(slides.length - 1, 0)));
  };

  if (slides.length === 0) {
    return <View style={[styles.empty, style]} />;
  }

  if (slides.length === 1) {
    return (
      <View style={[styles.wrap, style]}>
        <Image source={{ uri: slides[0] }} style={styles.slide} contentFit="cover" />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, style]}>
      <FlatList
        data={slides}
        keyExtractor={(uri, i) => `${uri}-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={[styles.slide, { width }]} contentFit="cover" />
        )}
      />
      <View style={styles.dots} pointerEvents="none">
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.counter} pointerEvents="none">
        <AppText variant="caption" color="text">
          {index + 1} / {slides.length}
        </AppText>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, height: number) {
  return StyleSheet.create({
    wrap: {
      height,
      width: '100%',
      backgroundColor: colors.card,
    },
    empty: {
      height,
      width: '100%',
      backgroundColor: colors.card,
    },
    slide: {
      height,
    },
    dots: {
      position: 'absolute',
      bottom: spacing.md,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.35)',
    },
    dotActive: {
      width: 18,
      backgroundColor: colors.primary,
    },
    counter: {
      position: 'absolute',
      bottom: spacing.md,
      right: spacing.screen,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.full,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
  });
}
