package com.vibook.backend.dto;

public record CategoryAdminResponse(
    Long id,
    String name,
    String slug,
    String icon,
    boolean active,
    long usageCount
) {
}
