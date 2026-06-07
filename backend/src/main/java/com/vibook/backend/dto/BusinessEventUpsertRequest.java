package com.vibook.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Request body for creating or fully replacing a business-owned event (POST / PUT).
 */
public record BusinessEventUpsertRequest(
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    String title,

    @NotNull(message = "Category (subcategory) is required")
    Long subcategoryId,

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 4000, message = "Description must be between 10 and 4000 characters")
    String description,

    @NotNull(message = "Event date is required")
    LocalDate eventDate,

    @NotEmpty(message = "At least one time slot is required")
    List<
        @NotBlank(message = "Time slot must not be blank")
        @Size(max = 32, message = "Time slot label is too long")
        String
    > timeSlots,

    @NotNull(message = "Governorate is required")
    Long governorateId,

    @Size(max = 512, message = "Google Maps URL must not exceed 512 characters")
    String googleMapsUrl,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be zero or greater")
    BigDecimal priceJod,

    @Size(max = 8, message = "Currency code must not exceed 8 characters")
    String currency,

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacityGuests,

    Boolean hidden,

    List<@Size(max = 1024, message = "Photo URL is too long") String> photoUrls
) {
}
