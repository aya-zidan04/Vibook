package com.vibook.backend.controller;

import com.vibook.backend.dto.FavoriteEventResponse;
import com.vibook.backend.dto.FavoriteResponse;
import com.vibook.backend.dto.FavoriteStatusResponse;
import com.vibook.backend.dto.MessageResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.FavoriteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping("/{eventId}/status")
    public ResponseEntity<FavoriteStatusResponse> status(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long eventId
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(favoriteService.getFavoriteStatus(eventId));
    }

    @GetMapping
    public ResponseEntity<Page<FavoriteEventResponse>> myFavorites(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(favoriteService.getMyFavorites(pageable));
    }

    @PostMapping("/{eventId}")
    public ResponseEntity<FavoriteResponse> add(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long eventId
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(favoriteService.addFavorite(eventId));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<MessageResponse> remove(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long eventId
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(favoriteService.removeFavorite(eventId));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
