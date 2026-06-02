import type { Ionicons } from '@expo/vector-icons';
import { buildMockExploreCategories } from '@/mock/categories';

export type ExploreSubcategory = {
  id: string;
  parentId: string;
  name: string;
  nameAr: string;
};

export type ExploreMainCategory = {
  id: string;
  name: string;
  nameAr: string;
  icon: keyof typeof Ionicons.glyphMap;
  subcategories: ExploreSubcategory[];
};

export type ExploreEventTaxonomyTag = {
  mainId: string;
  subcategoryId: string;
};

export const MOCK_EXPLORE_CATEGORIES: ExploreMainCategory[] = buildMockExploreCategories();

/** Frontend-only mapping used to filter mock Explore feed cards by selected category/subcategory. */
export const MOCK_EXPLORE_EVENT_TAGS: Record<string, ExploreEventTaxonomyTag> = {
  e1: { mainId: 'entertainment', subcategoryId: 'concerts' },
  e2: { mainId: 'entertainment', subcategoryId: 'comedy' },
  e3: { mainId: 'sports', subcategoryId: 'matches' },
};
