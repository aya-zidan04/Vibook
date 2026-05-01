export function formatDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === '') return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatFullName(first: string, last: string): string {
  return [first, last].filter(Boolean).join(' ').trim() || '—';
}
