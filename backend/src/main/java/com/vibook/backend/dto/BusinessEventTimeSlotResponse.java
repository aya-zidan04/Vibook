package com.vibook.backend.dto;

/** Bookable time slot row for event detail / checkout. */
public record BusinessEventTimeSlotResponse(Long id, String slotLabel, int sortOrder) {
}
