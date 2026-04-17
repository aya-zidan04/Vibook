package com.vibook.backend.dto;

public record SubcategoryResponse(
    Long id,
    Long categoryId,
    String name,
    String slug,
    boolean active
) {
}
