import { apiFetch } from '@/api/http';
import type { CategoryResponse, SubcategoryResponse } from '@/api/types';

export async function listCategories(): Promise<CategoryResponse[]> {
  return apiFetch<CategoryResponse[]>('/categories', { auth: false });
}

export async function listSubcategories(categoryId: number): Promise<SubcategoryResponse[]> {
  return apiFetch<SubcategoryResponse[]>(`/categories/${categoryId}/subcategories`, {
    auth: false,
  });
}
