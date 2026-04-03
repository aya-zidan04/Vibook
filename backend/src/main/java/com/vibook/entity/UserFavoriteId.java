package com.vibook.entity;

import com.vibook.entity.enums.ListingVertical;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class UserFavoriteId implements Serializable {

    @Column(name = "user_id", columnDefinition = "uuid", nullable = false)
    private UUID userId;

    @Column(name = "item_type", nullable = false, length = 32)
    private ListingVertical itemType;

    @Column(name = "ref_id", nullable = false)
    private Long refId;

    public UserFavoriteId() {
    }

    public UserFavoriteId(UUID userId, ListingVertical itemType, Long refId) {
        this.userId = userId;
        this.itemType = itemType;
        this.refId = refId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ListingVertical getItemType() {
        return itemType;
    }

    public void setItemType(ListingVertical itemType) {
        this.itemType = itemType;
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
        UserFavoriteId that = (UserFavoriteId) o;
        return Objects.equals(userId, that.userId)
                && itemType == that.itemType
                && Objects.equals(refId, that.refId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, itemType, refId);
    }
}
