import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { pickGalleryImage } from '@/utils/pickGalleryImage';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

type Props = {
  label: string;
  uri: string;
  onUriChange: (uri: string) => void;
  pickLabel: string;
  changeLabel: string;
  removeLabel: string;
  permissionTitle: string;
  permissionBody: string;
  /** Wide banner vs square logo preview. */
  variant: 'banner' | 'logo';
  /** Crop guide when editing is supported (mainly iOS). */
  aspect: [number, number];
};

export function ProfileImageField({
  label,
  uri,
  onUriChange,
  pickLabel,
  changeLabel,
  removeLabel,
  permissionTitle,
  permissionBody,
  variant,
  aspect,
}: Props) {
  const colors = useThemeColors();
  const styles = buildStyles(colors, variant);

  const openPicker = useCallback(async () => {
    const uri = await pickGalleryImage({ aspect, permissionTitle, permissionBody });
    if (uri) onUriChange(uri);
  }, [aspect, onUriChange, permissionBody, permissionTitle]);

  const hasPhoto = Boolean(uri.trim());

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" color="text" style={styles.label}>
        {label}
      </AppText>
      <Pressable
        onPress={() => void openPicker()}
        accessibilityRole="button"
        accessibilityLabel={hasPhoto ? changeLabel : pickLabel}
        style={({ pressed }) => [styles.previewOuter, pressed && styles.previewPressed]}
      >
        {hasPhoto ? (
          <Image source={{ uri: uri.trim() }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons
              name={variant === 'banner' ? 'image-outline' : 'camera-outline'}
              size={variant === 'banner' ? 36 : 32}
              color={colors.textMuted}
            />
            <AppText variant="caption" color="textMuted" style={styles.placeholderText}>
              {pickLabel}
            </AppText>
          </View>
        )}
      </Pressable>
      <View style={styles.actions}>
        <Pressable onPress={() => void openPicker()} hitSlop={8} style={styles.textBtn}>
          <AppText variant="caption" color="accent">
            {hasPhoto ? changeLabel : pickLabel}
          </AppText>
        </Pressable>
        {hasPhoto ? (
          <Pressable onPress={() => onUriChange('')} hitSlop={8} style={styles.textBtn}>
            <AppText variant="caption" color="textMuted">
              {removeLabel}
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function buildStyles(colors: ThemeColors, variant: 'banner' | 'logo') {
  const banner = variant === 'banner';
  return StyleSheet.create({
    wrap: { gap: spacing.xs, marginBottom: spacing.md },
    label: { fontWeight: '600' },
    previewOuter: {
      borderRadius: radii.xl,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.surfaceMuted,
      overflow: 'hidden',
      minHeight: banner ? 132 : 112,
      maxHeight: banner ? 160 : 112,
    },
    previewPressed: { opacity: 0.92 },
    previewImage: {
      width: '100%',
      minHeight: banner ? 132 : 112,
      aspectRatio: banner ? 16 / 9 : 1,
    },
    placeholder: {
      minHeight: banner ? 132 : 112,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
    },
    placeholderText: { textAlign: 'center' },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      marginTop: 2,
    },
    textBtn: { paddingVertical: 4 },
  });
}
