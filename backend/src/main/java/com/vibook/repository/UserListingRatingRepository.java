package com.vibook.repository;

import com.vibook.entity.UserListingRating;
import com.vibook.entity.UserListingRatingId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserListingRatingRepository extends JpaRepository<UserListingRating, UserListingRatingId> {

    List<UserListingRating> findByIdUserIdOrderByUpdatedAtDesc(UUID userId);
}
