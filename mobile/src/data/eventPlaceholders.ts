/** Curated Unsplash URLs for layout demos only — not affiliated with depicted events. */
export type PlaceholderEvent = {
  id: string;
  title: string;
  location: string;
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  imageUrl: string;
  category: string;
  description: string;
};

export const PLACEHOLDER_EVENTS: PlaceholderEvent[] = [
  {
    id: '1',
    title: 'Summer live sessions',
    location: 'Boulevard Arena · Downtown',
    dateLabel: 'Sat, Jun 14',
    timeLabel: '8:00 PM – 11:30 PM',
    priceLabel: 'From SAR 120',
    category: 'Music',
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=85&auto=format&fit=crop',
    description:
      'An open-air evening of curated performances and light installations. Arrive early for the sunset set; seating is general admission unless otherwise noted.',
  },
  {
    id: '2',
    title: 'Indie night: acoustic & vinyl',
    location: 'The Loft · Arts Quarter',
    dateLabel: 'Fri, Jun 20',
    timeLabel: '7:30 PM – 10:00 PM',
    priceLabel: 'From SAR 85',
    category: 'Music',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=85&auto=format&fit=crop',
    description:
      'Intimate acoustic sets paired with a vinyl listening corner. Limited capacity; doors close 15 minutes after start.',
  },
  {
    id: '3',
    title: 'City half marathon',
    location: 'Waterfront Promenade',
    dateLabel: 'Sun, Jun 22',
    timeLabel: '6:00 AM start',
    priceLabel: 'From SAR 45',
    category: 'Sports',
    imageUrl:
      'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200&q=85&auto=format&fit=crop',
    description:
      'Chip-timed course with hydration stations and a family fun run. Packet pickup details will be shared before race day.',
  },
  {
    id: '4',
    title: 'Contemporary art after hours',
    location: 'North Gallery',
    dateLabel: 'Thu, Jun 26',
    timeLabel: '6:00 PM – 9:00 PM',
    priceLabel: 'From SAR 35',
    category: 'Arts',
    imageUrl:
      'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=1200&q=85&auto=format&fit=crop',
    description:
      'Guided highlights tour plus open studios. Complimentary refreshments in the courtyard.',
  },
  {
    id: '5',
    title: 'Chef’s table: seasonal tasting',
    location: 'Harbor Kitchen Lab',
    dateLabel: 'Wed, Jul 2',
    timeLabel: '7:00 PM seating',
    priceLabel: 'From SAR 290',
    category: 'Food',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85&auto=format&fit=crop',
    description:
      'A multi-course tasting menu with optional beverage pairings. Dietary restrictions accepted with 48h notice.',
  },
  {
    id: '6',
    title: 'Sunrise yoga & sound bath',
    location: 'Rooftop Garden Spa',
    dateLabel: 'Sat, Jul 5',
    timeLabel: '6:30 AM – 8:00 AM',
    priceLabel: 'From SAR 75',
    category: 'Wellness',
    imageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=85&auto=format&fit=crop',
    description:
      'Guided movement, breathwork, and a closing sound bath. Mats provided; arrive 10 minutes early.',
  },
];

export function getPlaceholderEventById(id: string): PlaceholderEvent | undefined {
  return PLACEHOLDER_EVENTS.find((e) => e.id === id);
}
