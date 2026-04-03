package com.vibook.service;

import com.vibook.entity.UserListingRating;
import com.vibook.entity.UserListingRatingId;
import com.vibook.entity.enums.ListingVertical;
import com.vibook.repository.UserListingRatingRepository;
import com.vibook.web.dto.rating.RatingResponse;
import com.vibook.web.dto.rating.RatingsListResponse;
import com.vibook.web.dto.rating.UpsertRatingRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RatingService {

    private final UserListingRatingRepository ratingRepository;
    private final CatalogEntityExistsService catalogEntityExistsService;

    public RatingService(
            UserListingRatingRepository ratingRepository,
            CatalogEntityExistsService catalogEntityExistsService
    ) {
        this.ratingRepository = ratingRepository;
        this.catalogEntityExistsService = catalogEntityExistsService;
    }

    @Transactional(readOnly = true)
    public RatingsListResponse listRatings(UUID userId) {
        var ratings = ratingRepository.findByIdUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(RatingResponse::fromEntity)
                .toList();
        return new RatingsListResponse(ratings);
    }

    @Transactional
    public Optional<RatingResponse> upsertRating(UUID userId, ListingVertical vertical, long refId, UpsertRatingRequest request) {
        catalogEntityExistsService.assertListingRefExists(vertical, refId);
        UserListingRatingId id = new UserListingRatingId(userId, vertical, refId);
        if (request.stars() == null) {
            ratingRepository.deleteById(id);
            return Optional.empty();
        }
        int stars = request.stars();
        if (stars < 1 || stars > 5) {
            throw new IllegalArgumentException("stars must be between 1 and 5 inclusive");
        }
        Instant now = Instant.now();
        UserListingRating row = ratingRepository.findById(id).orElseGet(() -> {
            UserListingRating r = new UserListingRating();
            r.setId(id);
            return r;
        });
        row.setStars((short) stars);
        row.setUpdatedAt(now);
        return Optional.of(RatingResponse.fromEntity(ratingRepository.save(row)));
    }
}
