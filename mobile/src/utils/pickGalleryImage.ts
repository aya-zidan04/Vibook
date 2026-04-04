import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

type PickOptions = {
  aspect: [number, number];
  permissionTitle: string;
  permissionBody: string;
};

/** Opens the photo library; returns a `file://` URI or `null` if cancelled / denied. */
export async function pickGalleryImage({
  aspect,
  permissionTitle,
  permissionBody,
}: PickOptions): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(permissionTitle, permissionBody);
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.85,
  });
  if (!result.canceled && result.assets[0]?.uri) {
    return result.assets[0].uri;
  }
  return null;
}

type PickManyOptions = {
  permissionTitle: string;
  permissionBody: string;
  /** Max assets in this picker session (also capped by remaining slot in the UI). */
  selectionLimit?: number;
};

/** Opens the library with multi-select; returns local `file://` URIs (may be empty). */
export async function pickGalleryImages({
  permissionTitle,
  permissionBody,
  selectionLimit = 8,
}: PickManyOptions): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(permissionTitle, permissionBody);
    return [];
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) {
    return [];
  }
  return result.assets.map((a) => a.uri).filter(Boolean);
}
