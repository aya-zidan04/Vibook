export function formatPrice(amount: number, currency: string): string {
  if (amount === 0 && currency === 'AED') return 'Free';
  const sym =
    currency === 'SAR'
      ? 'SAR '
      : currency === 'AED'
        ? 'AED '
        : currency === 'USD'
          ? '$'
          : `${currency} `;
  return `${sym}${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}
