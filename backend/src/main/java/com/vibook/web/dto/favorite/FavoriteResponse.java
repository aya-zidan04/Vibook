package com.vibook.web.dto.favorite;

import com.vibook.entity.UserFavorite;

import java.time.Instant;

public record FavoriteResponse(
        String type,
        long refId,
        Instant createdAt
) {
    public static FavoriteResponse fromEntity(UserFavorite entity) {
        return new FavoriteResponse(
                entity.getId().getItemType().getApiKey(),
                entity.getId().getRefId(),
                entity.getCreatedAt()
        );
    }
}
