import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthResponse } from '@/api/types';

const STORAGE_KEY = 'vibook-auth-tokens';

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

let memory: StoredTokens | null = null;

export async function loadTokensFromStorage(): Promise<StoredTokens | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memory = null;
      return null;
    }
    const parsed = JSON.parse(raw) as StoredTokens;
    if (!parsed?.accessToken || !parsed?.refreshToken) {
      memory = null;
      return null;
    }
    memory = {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      tokenType: parsed.tokenType || 'Bearer',
    };
    return memory;
  } catch {
    memory = null;
    return null;
  }
}

export function getTokensSync(): StoredTokens | null {
  return memory;
}

export async function saveAuthResponse(auth: AuthResponse): Promise<void> {
  const next: StoredTokens = {
    accessToken: auth.token,
    refreshToken: auth.refreshToken,
    tokenType: auth.tokenType || 'Bearer',
  };
  memory = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function updateAccessToken(token: string, tokenType: string): Promise<void> {
  const cur = memory ?? (await loadTokensFromStorage());
  if (!cur) return;
  const next = { ...cur, accessToken: token, tokenType: tokenType || cur.tokenType };
  memory = next;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function clearTokens(): Promise<void> {
  memory = null;
  await AsyncStorage.removeItem(STORAGE_KEY);
}
