package com.vibook.backend.dto;

public record CategoryResponse(
    Long id,
    String name,
    String slug,
    String icon,
    boolean active
) {
}
