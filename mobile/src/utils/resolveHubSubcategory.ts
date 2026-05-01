import { listCategories, listSubcategories } from '@/api/categoriesApi';

/**
 * Resolves hub category picker value (`"Entertainment · Comedy"`) to API `subcategoryId`.
 */
export async function resolveSubcategoryIdForHubCategory(categoryDisplayEn: string): Promise<number | null> {
  const raw = categoryDisplayEn.trim();
  const parts = raw.split(' · ').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  const [catName, subName] = parts;
  const categories = await listCategories();
  const cat = categories.find((c) => c.name === catName && c.active);
  if (!cat) return null;
  const subs = await listSubcategories(cat.id);
  const sub = subs.find((s) => s.name === subName && s.active);
  return sub?.id ?? null;
}
