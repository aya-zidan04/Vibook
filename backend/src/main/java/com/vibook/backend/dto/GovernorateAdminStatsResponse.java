package com.vibook.backend.dto;

public record GovernorateAdminStatsResponse(
    Long id,
    String name,
    int displayOrder,
    boolean active,
    long businessCount
) {
}
