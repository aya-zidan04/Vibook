import Ionicons from '@expo/vector-icons/Ionicons';

/** Backend seeds use short names (e.g. `calendar`); explore strip prefers `-outline` glyphs. */
export function backendIconToOutline(raw: string): keyof typeof Ionicons.glyphMap {
  const trimmed = raw.trim();
  if (!trimmed) return 'apps-outline';
  const base = trimmed.replace(/-outline$/i, '');
  const withOutline = `${base}-outline`;
  if (withOutline in Ionicons.glyphMap) {
    return withOutline as keyof typeof Ionicons.glyphMap;
  }
  if (trimmed in Ionicons.glyphMap) {
    return trimmed as keyof typeof Ionicons.glyphMap;
  }
  return 'apps-outline';
}
