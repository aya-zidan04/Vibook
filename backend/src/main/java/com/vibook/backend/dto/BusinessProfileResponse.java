package com.vibook.backend.dto;

import com.vibook.backend.entity.BusinessProfileStatus;
import java.time.Instant;

public record BusinessProfileResponse(
    Long id,
    String businessName,
    String tagline,
    String bannerImageUrl,
    String logoImageUrl,
    Long primaryCategoryId,
    String primaryCategoryName,
    String description,
    String workEmail,
    String phone,
    Long governorateId,
    String governorateName,
    String googleMapsUrl,
    String website,
    BusinessProfileStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
