package com.vibook.backend.dto;

public record AdminEventDetailPayload(
    BusinessEventResponse event,
    String adminNotes
) {
}
