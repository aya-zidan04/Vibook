import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'vibook_access_token';
const REFRESH_KEY = 'vibook_refresh_token';

const preferSecure = Platform.OS === 'ios' || Platform.OS === 'android';

async function setSecret(key: string, value: string): Promise<void> {
  if (preferSecure) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

async function getSecret(key: string): Promise<string | null> {
  if (preferSecure) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function deleteSecret(key: string): Promise<void> {
  if (preferSecure) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await setSecret(ACCESS_KEY, tokens.accessToken);
  await setSecret(REFRESH_KEY, tokens.refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return getSecret(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getSecret(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await deleteSecret(ACCESS_KEY);
  await deleteSecret(REFRESH_KEY);
}
