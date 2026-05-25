import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { createPremiumSheetStyles } from '@/components/sheet/premiumSheetStyles';
import { useThemeColors } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  writingDirection?: 'ltr' | 'rtl';
};

export function PremiumSheetPickCard({
  title,
  subtitle,
  selected,
  onPress,
  accessibilityLabel,
  writingDirection = 'ltr',
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createPremiumSheetStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.pickCard,
        selected && styles.pickCardSelected,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={{ flex: 1, gap: 4, marginEnd: 12 }}>
        <AppText variant="body-em" color="text" style={{ textAlign: 'left', writingDirection }}>
          {title}
        </AppText>
        <AppText variant="caption" color="textMuted" style={{ textAlign: 'left', writingDirection }}>
          {subtitle}
        </AppText>
      </View>
      {selected ? (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={18} color={colors.textOnPrimary} />
        </View>
      ) : (
        <View style={styles.radioEmpty} />
      )}
    </Pressable>
  );
}
