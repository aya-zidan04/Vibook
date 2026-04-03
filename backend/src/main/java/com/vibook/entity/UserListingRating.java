package com.vibook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "user_listing_ratings")
public class UserListingRating {

    @EmbeddedId
    private UserListingRatingId id;

    @Column(nullable = false, columnDefinition = "smallint")
    private short stars;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UserListingRatingId getId() {
        return id;
    }

    public void setId(UserListingRatingId id) {
        this.id = id;
    }

    public short getStars() {
        return stars;
    }

    public void setStars(short stars) {
        this.stars = stars;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
