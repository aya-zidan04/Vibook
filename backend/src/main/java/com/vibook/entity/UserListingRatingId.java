package com.vibook.entity;

import com.vibook.entity.enums.ListingVertical;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class UserListingRatingId implements Serializable {

    @Column(name = "user_id", columnDefinition = "uuid", nullable = false)
    private UUID userId;

    @Column(name = "vertical", nullable = false, length = 32)
    private ListingVertical vertical;

    @Column(name = "ref_id", nullable = false)
    private Long refId;

    public UserListingRatingId() {
    }

    public UserListingRatingId(UUID userId, ListingVertical vertical, Long refId) {
        this.userId = userId;
        this.vertical = vertical;
        this.refId = refId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ListingVertical getVertical() {
        return vertical;
    }

    public void setVertical(ListingVertical vertical) {
        this.vertical = vertical;
    }

    public Long getRefId() {
        return refId;
    }

    public void setRefId(Long refId) {
        this.refId = refId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserListingRatingId that = (UserListingRatingId) o;
        return Objects.equals(userId, that.userId)
                && vertical == that.vertical
                && Objects.equals(refId, that.refId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, vertical, refId);
    }
}
