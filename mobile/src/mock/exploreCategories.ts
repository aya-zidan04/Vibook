import { Ionicons } from '@expo/vector-icons';

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

export const MOCK_EXPLORE_CATEGORIES: ExploreMainCategory[] = [
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameAr: 'ترفيه',
    icon: 'musical-notes-outline',
    subcategories: [
      { id: 'comedy', parentId: 'entertainment', name: 'Comedy', nameAr: 'كوميديا' },
      { id: 'theater', parentId: 'entertainment', name: 'Theater', nameAr: 'مسرح' },
      { id: 'concerts', parentId: 'entertainment', name: 'Concerts', nameAr: 'حفلات' },
    ],
  },
  {
    id: 'dining',
    name: 'Dining',
    nameAr: 'مطاعم ومقاهي',
    icon: 'restaurant-outline',
    subcategories: [
      { id: 'restaurants', parentId: 'dining', name: 'Restaurants', nameAr: 'مطاعم' },
      { id: 'cafes', parentId: 'dining', name: 'Cafes', nameAr: 'مقاهي' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    nameAr: 'رياضة',
    icon: 'football-outline',
    subcategories: [
      { id: 'matches', parentId: 'sports', name: 'Matches', nameAr: 'مباريات' },
      { id: 'activities', parentId: 'sports', name: 'Activities', nameAr: 'أنشطة' },
      { id: 'fitness', parentId: 'sports', name: 'Fitness', nameAr: 'لياقة' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning',
    nameAr: 'تعليم',
    icon: 'school-outline',
    subcategories: [
      { id: 'conferences', parentId: 'learning', name: 'Conferences', nameAr: 'مؤتمرات' },
      { id: 'workshops', parentId: 'learning', name: 'Workshops', nameAr: 'ورش عمل' },
      { id: 'courses', parentId: 'learning', name: 'Courses', nameAr: 'دورات' },
    ],
  },
];

/** Frontend-only mapping used to filter mock Explore feed cards by selected category/subcategory. */
export const MOCK_EXPLORE_EVENT_TAGS: Record<string, ExploreEventTaxonomyTag> = {
  e1: { mainId: 'entertainment', subcategoryId: 'concerts' },
  e2: { mainId: 'entertainment', subcategoryId: 'comedy' },
  e3: { mainId: 'sports', subcategoryId: 'matches' },
};
