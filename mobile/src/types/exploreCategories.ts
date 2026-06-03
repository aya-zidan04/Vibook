import type { Ionicons } from '@expo/vector-icons';

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
