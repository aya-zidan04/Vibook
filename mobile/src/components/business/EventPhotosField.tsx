import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { pickGalleryImages } from '@/utils/pickGalleryImage';
import { radii, spacing, useThemeColors } from '@/theme';
import type { ThemeColors } from '@/theme/palettes';

const MAX_PHOTOS = 12;
const PICK_BATCH = 8;

type Props = {
  label: string;
  hint: string;
  uris: string[];
  onUrisChange: (uris: string[]) => void;
  addAccessibilityLabel: string;
  removeAccessibilityLabel: string;
  permissionTitle: string;
  permissionBody: string;
};

export function EventPhotosField({
  label,
  hint,
  uris,
  onUrisChange,
  addAccessibilityLabel,
  removeAccessibilityLabel,
  permissionTitle,
  permissionBody,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const addPhotos = useCallback(async () => {
    const remaining = MAX_PHOTOS - uris.length;
    if (remaining <= 0) return;
    const picked = await pickGalleryImages({
      permissionTitle,
      permissionBody,
      selectionLimit: Math.min(PICK_BATCH, remaining),
    });
    if (picked.length === 0) return;
    onUrisChange([...uris, ...picked].slice(0, MAX_PHOTOS));
  }, [onUrisChange, permissionBody, permissionTitle, uris]);

  const removeAt = useCallback(
    (index: number) => {
      onUrisChange(uris.filter((_, i) => i !== index));
    },
    [onUrisChange, uris],
  );

  const canAdd = uris.length < MAX_PHOTOS;

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="text">
        {label}
      </AppText>
      <View style={[styles.card, { borderColor: colors.borderLight, backgroundColor: colors.surfaceMuted }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {uris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.thumbWrap}>
              <Image source={{ uri }} style={styles.thumb} contentFit="cover" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={removeAccessibilityLabel}
                onPress={() => removeAt(index)}
                style={({ pressed }) => [styles.removeHit, pressed && styles.removePressed]}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={26} color="rgba(0,0,0,0.55)" />
              </Pressable>
            </View>
          ))}
          {canAdd ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={addAccessibilityLabel}
              onPress={() => void addPhotos()}
              style={({ pressed }) => [styles.addTile, { borderColor: colors.borderLight }, pressed && styles.addPressed]}
            >
              <View style={[styles.addIconBg, { backgroundColor: colors.primaryMuted }]}>
                <Ionicons name="images-outline" size={24} color={colors.primary} />
              </View>
              <Ionicons name="add-circle" size={22} color={colors.primary} style={styles.addPlus} />
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
      {uris.length === 0 ? (
        <AppText variant="label" color="textMuted" style={styles.hintBelow}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    card: {
      borderRadius: radii.xl,
      borderWidth: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    scrollContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      paddingVertical: 2,
    },
    thumbWrap: {
      width: 88,
      height: 88,
      borderRadius: radii.md,
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    thumb: {
      width: '100%',
      height: '100%',
    },
    removeHit: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: 'rgba(255,250,245,0.92)',
      borderRadius: radii.full,
    },
    removePressed: { opacity: 0.85 },
    addTile: {
      width: 88,
      height: 88,
      borderRadius: radii.md,
      borderStyle: 'dashed',
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      backgroundColor: colors.surface,
    },
    addPressed: { opacity: 0.9 },
    addIconBg: {
      width: 36,
      height: 36,
      borderRadius: radii.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addPlus: { marginTop: -2 },
    hintBelow: { marginTop: 2, lineHeight: 18 },
  });
}
