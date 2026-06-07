/** Clamp ticket quantity to [1, maxQuantity] when capacity is known. */
export function clampTicketQuantity(quantity: number, maxQuantity: number | null | undefined): number {
  if (maxQuantity == null || !Number.isFinite(maxQuantity)) {
    return Math.max(1, quantity);
  }
  if (maxQuantity <= 0) {
    return 1;
  }
  return Math.min(Math.max(1, quantity), maxQuantity);
}

export function canIncreaseTicketQuantity(quantity: number, maxQuantity: number | null | undefined): boolean {
  if (maxQuantity == null || !Number.isFinite(maxQuantity)) {
    return true;
  }
  return maxQuantity > 0 && quantity < maxQuantity;
}
