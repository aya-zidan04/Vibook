/** Route param is numeric → call catalog detail APIs. */
export function isNumericCatalogId(id: string | undefined | null): boolean {
  if (id == null || id === '') return false;
  return /^\d+$/.test(id.trim());
}

export function parseCatalogNumericId(id: string | undefined): number | null {
  if (!isNumericCatalogId(id ?? null)) return null;
  return Number(id);
}

export type CatalogRouter = { push: (href: string) => void };
