/** Resolve API-relative file paths (e.g. `/api/v1/files/...`) to an absolute URL for `<img src>`. */
export function resolveMediaUrl(pathOrUrl: string | null | undefined): string | null {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
  const origin = apiBase.replace(/\/api\/v1\/?$/i, '');
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}
