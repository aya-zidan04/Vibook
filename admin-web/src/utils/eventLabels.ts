/** Category + subcategory label aligned with DB subcategory_id → categories hierarchy. */
export function formatEventCategory(
  categoryName: string | null | undefined,
  subcategoryName: string | null | undefined,
): string | null {
  const cat = categoryName?.trim();
  const sub = subcategoryName?.trim();
  if (cat && sub) return `${cat} · ${sub}`;
  return cat ?? sub ?? null;
}
