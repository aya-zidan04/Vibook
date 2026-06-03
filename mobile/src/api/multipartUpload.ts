import { getApiBaseUrl } from '@/api/env';
import { ApiError } from '@/api/http';
import type { ErrorResponse } from '@/api/types';
import { getTokensSync, loadTokensFromStorage } from '@/api/authSession';

function guessMime(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
}

function guessFilename(uri: string): string {
  const part = uri.split('/').pop();
  if (part && part.includes('.')) return part;
  return 'upload.jpg';
}

/** Multipart POST with Bearer token when the user is signed in. */
export async function apiUploadMultipart<T>(
  path: string,
  fieldName: string,
  localUri: string,
): Promise<T> {
  if (!localUri.trim() || !localUri.startsWith('file:')) {
    throw new Error('invalid_local_image_uri');
  }

  if (!getTokensSync()?.accessToken) {
    await loadTokensFromStorage();
  }
  const token = getTokensSync()?.accessToken;
  const scheme = getTokensSync()?.tokenType || 'Bearer';

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const form = new FormData();
  form.append(fieldName, {
    uri: localUri,
    name: guessFilename(localUri),
    type: guessMime(localUri),
  } as unknown as Blob);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `${scheme} ${token}`;
  }

  const res = await fetch(url, { method: 'POST', body: form, headers });
  const text = await res.text();
  let parsed: unknown = text;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) {
    const msg =
      typeof parsed === 'object' && parsed !== null && 'message' in parsed
        ? String((parsed as ErrorResponse).message)
        : res.statusText;
    throw new ApiError(res.status, parsed, msg || `http_${res.status}`);
  }
  return parsed as T;
}
