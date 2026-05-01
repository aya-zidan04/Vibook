import { listMyBusinessBookings } from '@/api/businessBookingsApi';
import { listMyBusinessEvents } from '@/api/businessEventsApi';
import {
  businessBookingResponseToRecord,
  businessEventSummaryToRecord,
} from '@/utils/businessHubMappers';
import { useBusinessHubStore } from '@/store/businessHubStore';

/** Loads partner events + bookings from the API into the hub store. */
export async function refreshBusinessHubLists(): Promise<void> {
  const [summaries, bookings] = await Promise.all([listMyBusinessEvents(), listMyBusinessBookings()]);
  useBusinessHubStore.getState().replaceHubEvents(summaries.map(businessEventSummaryToRecord));
  useBusinessHubStore.getState().replaceHubBookings(bookings.map(businessBookingResponseToRecord));
}
