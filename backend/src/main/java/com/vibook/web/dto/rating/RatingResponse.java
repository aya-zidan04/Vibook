package com.vibook.web.dto.rating;

import com.vibook.entity.UserListingRating;

import java.time.Instant;

public record RatingResponse(
        String vertical,
        long refId,
        int stars,
        Instant updatedAt
) {
    public static RatingResponse fromEntity(UserListingRating entity) {
        return new RatingResponse(
                entity.getId().getVertical().getApiKey(),
                entity.getId().getRefId(),
                entity.getStars(),
                entity.getUpdatedAt()
        );
    }
}
