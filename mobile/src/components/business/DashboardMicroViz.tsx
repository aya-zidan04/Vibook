import { StyleSheet, View } from 'react-native';
import type { ThemeColors } from '@/theme/palettes';

type BarsProps = {
  values: number[];
  colors: ThemeColors;
  /** Max bar height in px */
  maxHeight?: number;
  /** Narrow bars → sparkline-like */
  dense?: boolean;
  /** Override bar fill (e.g. cream on dark hero) */
  barColor?: string;
};

/** Soft vertical bars; no external chart libs. */
export function MicroBars({
  values,
  colors,
  maxHeight = 32,
  dense = false,
  barColor,
}: BarsProps) {
  const fill = barColor ?? colors.primary;
  const max = Math.max(1, ...values, 0.001);
  const gap = dense ? 2 : 4;
  const minW = dense ? 3 : 5;
  return (
    <View style={[styles.barsRow, { height: maxHeight, gap }]}>
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * maxHeight);
        const intensity = 0.35 + 0.5 * (v / max);
        return (
          <View key={i} style={[styles.barCell, { minWidth: minW, maxHeight }]}>
            <View
              style={[
                styles.barFill,
                {
                  height: h,
                  backgroundColor: fill,
                  opacity: intensity,
                  borderRadius: dense ? 1 : 3,
                },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

type SparkProps = {
  values: number[];
  colors: ThemeColors;
  maxHeight?: number;
  barColor?: string;
};

/** Thinner silhouette — reads as a gentle trend. */
export function MicroSparkline({ values, colors, maxHeight = 14, barColor }: SparkProps) {
  return (
    <MicroBars
      values={values}
      colors={colors}
      maxHeight={maxHeight}
      dense
      barColor={barColor}
    />
  );
}

type CompletionProps = {
  ratio: number;
  colors: ThemeColors;
  height?: number;
};

export function CompletionTrack({ ratio, colors, height = 4 }: CompletionProps) {
  const clamped = Math.min(1, Math.max(0, ratio));
  return (
    <View style={[styles.track, { height, backgroundColor: colors.borderLight }]}>
      <View
        style={[
          styles.trackFill,
          {
            width: `${Math.round(clamped * 100)}%`,
            height,
            backgroundColor: colors.accent,
            opacity: 0.85,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barCell: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    maxWidth: 10,
  },
  track: {
    borderRadius: 100,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  trackFill: {
    borderRadius: 100,
  },
});
