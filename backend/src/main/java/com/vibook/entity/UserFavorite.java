package com.vibook.entity;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "user_favorites")
public class UserFavorite {

    @EmbeddedId
    private UserFavoriteId id;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public UserFavoriteId getId() {
        return id;
    }

    public void setId(UserFavoriteId id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
