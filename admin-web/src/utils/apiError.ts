import axios from 'axios';

/** User-safe message; logs technical detail in dev console only. */
export function getFriendlyErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    if (import.meta.env.DEV) {
      console.warn('[API]', status, data ?? err.message);
    }
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Cannot reach the API. Start Spring Boot on port 8080, check MySQL, and verify the admin app points at …/api/v1 (see browser console for the resolved base URL).';
    }
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const msg = String((data as { message: string }).message);
      if (msg && msg !== 'undefined') return msg;
    }
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 401) return 'Please sign in again.';
    if (status != null && status >= 500) return 'Something went wrong on the server. Please try again later.';
    return fallback;
  }
  if (err instanceof Error && err.message) {
    if (import.meta.env.DEV) console.warn(err);
    return err.message;
  }
  return fallback;
}
