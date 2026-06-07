package com.vibook.backend.util;

import com.vibook.backend.entity.BookingStatus;
import java.util.List;

/** How event guest capacity is reserved and released across booking statuses. */
public final class BookingCapacityPolicy {

    public static final List<BookingStatus> OCCUPYING_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private BookingCapacityPolicy() {}

    public static int remainingCapacity(int capacityGuests, int bookedGuests) {
        return Math.max(0, capacityGuests - bookedGuests);
    }
}
