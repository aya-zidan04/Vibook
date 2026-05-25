/**
 * Resolves API root. Must end with `/api/v1` to match Spring controllers.
 */
export function resolveApiBaseUrl(envValue: string | undefined): string {
  const raw = envValue?.trim();
  if (!raw) {
    return '/api/v1';
  }
  let base = raw.replace(/\/+$/, '');
  if (!base.endsWith('/api/v1')) {
    base = `${base}/api/v1`;
  }
  return base;
}
