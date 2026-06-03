import { getEventById } from '@/api/eventsApi';
import { businessEventDetailToEventItem } from '@/services/api/eventMap';

export type FavoritePreview = {
  title: string;
  subtitle: string;
  imageUrl: string;
  priceFrom?: number;
  currency?: string;
};

/** Deep-link segment for `app/{segment}/[id]`. */
export function catalogRouteSegment(type: string): string {
  switch (type) {
    case 'event':
      return 'event';
    case 'restaurant':
      return 'restaurant';
    case 'experience':
      return 'experience';
    case 'stay':
      return 'stay';
    case 'package':
      return 'package';
    case 'organizer':
      return 'organizer';
    default:
      return 'explore';
  }
}

export async function loadFavoritePreview(
  type: string,
  refId: string,
): Promise<FavoritePreview | null> {
  if (type !== 'event' || !/^\d+$/.test(refId)) {
    return null;
  }
  try {
    const raw = await getEventById(Number(refId));
    const e = businessEventDetailToEventItem(raw);
    return {
      title: e.title,
      subtitle: e.venueName,
      imageUrl: e.imageUrl,
      priceFrom: e.priceFrom,
      currency: e.currency,
    };
  } catch {
    return null;
  }
}
