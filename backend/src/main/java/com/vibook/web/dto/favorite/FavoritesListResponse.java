package com.vibook.web.dto.favorite;

import java.util.List;

public record FavoritesListResponse(List<FavoriteResponse> favorites) {
}
