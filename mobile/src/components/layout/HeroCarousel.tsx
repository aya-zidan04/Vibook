import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/ui/AppText';
import { colors, radii, spacing } from '@/theme';

export type HeroSlide = {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
};

type Props = {
  slides: HeroSlide[];
  onSlidePress?: (id: string) => void;
};

const { width: W } = Dimensions.get('window');
const HEIGHT = 200;
const PAD = 20;
const CARD_W = W - PAD * 2;

export function HeroCarousel({ slides, onSlidePress }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / (CARD_W + spacing.md));
    setIndex(Math.min(Math.max(i, 0), slides.length - 1));
  };

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_W + spacing.md}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSlidePress?.(item.id)}
            style={({ pressed }) => [
              styles.card,
              { width: CARD_W, marginRight: spacing.md },
              pressed && { opacity: 0.94 },
            ]}
          >
            <ImageBackground source={{ uri: item.imageUrl }} style={styles.image} imageStyle={styles.imageRadius}>
              <LinearGradient
                colors={['transparent', 'rgba(7,11,20,0.95)']}
                style={styles.gradient}
              >
                <AppText variant="overline" color="accent" style={styles.kicker}>
                  Featured
                </AppText>
                <AppText variant="h2" color="text" numberOfLines={2}>
                  {item.title}
                </AppText>
                <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.sub}>
                  {item.subtitle}
                </AppText>
              </LinearGradient>
            </ImageBackground>
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  listContent: {
    paddingHorizontal: PAD,
    paddingVertical: 2,
  },
  card: {
    height: HEIGHT,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { flex: 1, justifyContent: 'flex-end' },
  imageRadius: { borderRadius: radii.xl },
  gradient: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  kicker: { marginBottom: spacing.xs, opacity: 0.95 },
  sub: { marginTop: 6 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
