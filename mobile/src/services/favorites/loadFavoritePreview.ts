import {
  getEventById,
  getExperienceById,
  getFlightById,
  getHotelById,
  getOrganizerById,
  getPackageById,
  getRestaurantById,
} from '@/services/mock';

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
    case 'flight':
      return 'flight';
    case 'organizer':
      return 'organizer';
    default:
      return 'explore';
  }
}

export function loadFavoritePreview(type: string, refId: string): FavoritePreview | null {
  switch (type) {
    case 'event': {
      const e = getEventById(refId);
      if (!e) return null;
      return {
        title: e.title,
        subtitle: e.venueName,
        imageUrl: e.imageUrl,
        priceFrom: e.priceFrom,
        currency: e.currency,
      };
    }
    case 'restaurant': {
      const r = getRestaurantById(refId);
      if (!r) return null;
      return {
        title: r.name,
        subtitle: '',
        imageUrl: r.imageUrl,
      };
    }
    case 'experience': {
      const x = getExperienceById(refId);
      if (!x) return null;
      return {
        title: x.title,
        subtitle: `${x.durationHours}h`,
        imageUrl: x.imageUrl,
        priceFrom: x.priceFrom,
        currency: x.currency,
      };
    }
    case 'stay': {
      const h = getHotelById(refId);
      if (!h) return null;
      return {
        title: h.name,
        subtitle: `${h.stars}★`,
        imageUrl: h.imageUrl,
        priceFrom: h.priceFrom,
        currency: h.currency,
      };
    }
    case 'package': {
      const p = getPackageById(refId);
      if (!p) return null;
      return {
        title: p.title,
        subtitle: `${p.nights} nights`,
        imageUrl: p.imageUrl,
        priceFrom: p.priceFrom,
        currency: p.currency,
      };
    }
    case 'flight': {
      const f = getFlightById(refId);
      if (!f) return null;
      return {
        title: `${f.from} → ${f.to}`,
        subtitle: f.airline,
        imageUrl:
          'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop',
        priceFrom: f.price,
        currency: f.currency,
      };
    }
    case 'organizer': {
      const o = getOrganizerById(refId);
      if (!o) return null;
      return {
        title: o.name,
        subtitle: o.about.slice(0, 80) + (o.about.length > 80 ? '…' : ''),
        imageUrl: o.logoUrl,
      };
    }
    default:
      return null;
  }
}
