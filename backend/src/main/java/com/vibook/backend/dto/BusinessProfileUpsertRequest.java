package com.vibook.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record BusinessProfileUpsertRequest(
    @NotBlank(message = "Business name is required")
    @Size(max = 150, message = "Business name must not exceed 150 characters")
    String businessName,

    @Size(max = 255, message = "Tagline must not exceed 255 characters")
    String tagline,

    @NotNull(message = "Primary category is required")
    Long primaryCategoryId,

    @Size(max = 800, message = "Description must not exceed 800 characters")
    String description,

    @Email(message = "Work email must be a valid email address")
    @Size(max = 120, message = "Work email must not exceed 120 characters")
    String workEmail,

    /** Digits, spaces, and common phone punctuation (international formats). */
    @Pattern(
        regexp = "^[\\+]?[0-9\\s().\\-]{6,30}$",
        message = "Phone format is invalid"
    )
    @Size(max = 30, message = "Phone must not exceed 30 characters")
    String phone,

    @NotNull(message = "Governorate is required")
    Long governorateId,

    @Size(max = 512, message = "Google Maps URL must not exceed 512 characters")
    String googleMapsUrl,

    @Size(max = 512, message = "Website must not exceed 512 characters")
    String website
) {
}
