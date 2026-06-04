import type { BusinessTicketOption } from '@/types/businessHub';
import type { EventItem, TicketTier } from '@/types';

/** Lowest ticket price for list cards / “from” labels. */
export function minTicketPriceJod(ticketOptions: BusinessTicketOption[]): number {
  if (!ticketOptions.length) return 0;
  const nums = ticketOptions.map((t) => (Number.isFinite(t.priceJod) ? Math.max(0, t.priceJod) : 0));
  return Math.min(...nums);
}

/** Maps persisted business ticket rows to PDP / checkout {@link TicketTier} rows. */
export function businessTicketOptionsToTicketTiers(
  eventId: string,
  ticketOptions: BusinessTicketOption[],
): TicketTier[] {
  return ticketOptions.map((opt) => {
    const desc = opt.description?.trim();
    return {
      id: opt.id,
      eventId,
      name: opt.name.trim() || 'Ticket',
      price: Number.isFinite(opt.priceJod) ? Math.max(0, opt.priceJod) : 0,
      currency: opt.currency?.trim() || 'JOD',
      benefits: desc ? [desc] : [],
      ...(desc ? { description: desc } : {}),
    };
  });
}

/** One synthetic tier for catalogue events that only expose {@link EventItem#priceFrom}. */
export function syntheticTierFromEventItem(ev: EventItem): TicketTier {
  return {
    id: `${ev.id}-tier-default`,
    eventId: ev.id,
    name: 'General admission',
    price: Number.isFinite(ev.priceFrom) ? Math.max(0, ev.priceFrom) : 0,
    currency: ev.currency || 'JOD',
    benefits: [],
  };
}
