import { Alert, Linking } from 'react-native';

export const SUPPORT_EMAIL = 'support@vibook.com';

/**
 * Opens the default mail app with a pre-filled recipient (and optional subject).
 * Falls back to an alert with the address if no handler is available.
 */
export async function openSupportEmail(subject: string): Promise<void> {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  const url = `mailto:${SUPPORT_EMAIL}${query}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(SUPPORT_EMAIL, subject ? `${subject}\n\n${SUPPORT_EMAIL}` : SUPPORT_EMAIL);
  }
}
