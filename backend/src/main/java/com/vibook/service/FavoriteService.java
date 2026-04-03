package com.vibook.service;

import com.vibook.entity.UserFavorite;
import com.vibook.entity.UserFavoriteId;
import com.vibook.entity.enums.ListingVertical;
import com.vibook.repository.UserFavoriteRepository;
import com.vibook.web.dto.favorite.FavoriteResponse;
import com.vibook.web.dto.favorite.FavoritesListResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class FavoriteService {

    private final UserFavoriteRepository favoriteRepository;
    private final CatalogEntityExistsService catalogEntityExistsService;

    public FavoriteService(
            UserFavoriteRepository favoriteRepository,
            CatalogEntityExistsService catalogEntityExistsService
    ) {
        this.favoriteRepository = favoriteRepository;
        this.catalogEntityExistsService = catalogEntityExistsService;
    }

    @Transactional(readOnly = true)
    public FavoritesListResponse listFavorites(UUID userId) {
        var list = favoriteRepository.findByIdUserIdOrderByCreatedAtDesc(userId).stream()
                .map(FavoriteResponse::fromEntity)
                .toList();
        return new FavoritesListResponse(list);
    }

    @Transactional
    public FavoriteResponse addFavorite(UUID userId, ListingVertical type, long refId) {
        catalogEntityExistsService.assertListingRefExists(type, refId);
        UserFavoriteId id = new UserFavoriteId(userId, type, refId);
        return favoriteRepository.findById(id)
                .map(FavoriteResponse::fromEntity)
                .orElseGet(() -> {
                    UserFavorite f = new UserFavorite();
                    f.setId(id);
                    f.setCreatedAt(Instant.now());
                    return FavoriteResponse.fromEntity(favoriteRepository.save(f));
                });
    }

    @Transactional
    public void removeFavorite(UUID userId, ListingVertical type, long refId) {
        favoriteRepository.deleteById(new UserFavoriteId(userId, type, refId));
    }
}
