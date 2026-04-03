package com.vibook.web.controller;

import com.vibook.entity.enums.ListingVertical;
import com.vibook.security.SecurityUserPrincipal;
import com.vibook.service.RatingService;
import com.vibook.web.dto.rating.RatingResponse;
import com.vibook.web.dto.rating.RatingsListResponse;
import com.vibook.web.dto.rating.UpsertRatingRequest;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/ratings")
@Validated
public class MeRatingsController {

    private final RatingService ratingService;

    public MeRatingsController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @GetMapping
    public RatingsListResponse listRatings(@AuthenticationPrincipal SecurityUserPrincipal principal) {
        return ratingService.listRatings(principal.getId());
    }

    @PutMapping("/{vertical}/{refId}")
    public ResponseEntity<RatingResponse> upsertRating(
            @AuthenticationPrincipal SecurityUserPrincipal principal,
            @PathVariable String vertical,
            @PathVariable @Positive long refId,
            @RequestBody(required = false) UpsertRatingRequest body
    ) {
        ListingVertical v = ListingVertical.fromApiPath(vertical);
        UpsertRatingRequest request = body == null ? new UpsertRatingRequest(null) : body;
        return ratingService.upsertRating(principal.getId(), v, refId, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
