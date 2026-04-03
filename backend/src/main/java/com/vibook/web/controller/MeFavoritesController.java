package com.vibook.web.controller;

import com.vibook.entity.enums.ListingVertical;
import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.FavoriteService;
import com.vibook.web.dto.favorite.FavoriteResponse;
import com.vibook.web.dto.favorite.FavoritesListResponse;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/favorites")
@Validated
public class MeFavoritesController {

    private final FavoriteService favoriteService;

    public MeFavoritesController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public FavoritesListResponse listFavorites(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return favoriteService.listFavorites(principal.getId());
    }

    @PutMapping("/{type}/{refId}")
    public FavoriteResponse addFavorite(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String type,
            @PathVariable @Positive long refId
    ) {
        ListingVertical v = ListingVertical.fromApiPath(type);
        return favoriteService.addFavorite(principal.getId(), v, refId);
    }

    @DeleteMapping("/{type}/{refId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String type,
            @PathVariable @Positive long refId
    ) {
        ListingVertical v = ListingVertical.fromApiPath(type);
        favoriteService.removeFavorite(principal.getId(), v, refId);
    }
}
