package com.vibook.backend.dto;

public record GovernorateResponse(
    Long id,
    String name,
    Integer displayOrder,
    boolean active
) {
}
