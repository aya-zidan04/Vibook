package com.vibook.backend.mapper;

import com.vibook.backend.dto.FavoriteEventResponse;
import com.vibook.backend.dto.FavoriteResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Favorite;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.Subcategory;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class FavoriteMapper {

    private static final int DESCRIPTION_PREVIEW_MAX = 280;

    public FavoriteResponse toFavoriteResponse(Favorite entity) {
        BusinessEvent event = entity.getBusinessEvent();
        return new FavoriteResponse(
            entity.getId(),
            event.getId(),
            event.getTitle(),
            entity.getCreatedAt()
        );
    }

    public FavoriteEventResponse toFavoriteEventResponse(Favorite favorite) {
        BusinessEvent event = favorite.getBusinessEvent();
        Subcategory sub = event.getSubcategory();
        Category cat = sub != null ? sub.getCategory() : null;
        Governorate gov = event.getGovernorate();

        String cover = event.getPhotos().isEmpty() ? null : event.getPhotos().get(0).getImageUrl();
        List<String> slots = event.getTimeSlots().stream().map(BusinessEventTimeSlot::getSlotLabel).toList();

        return new FavoriteEventResponse(
            event.getId(),
            event.getTitle(),
            truncateDescription(event.getDescription()),
            event.getEventDate(),
            slots,
            gov != null ? gov.getName() : null,
            sub != null ? sub.getName() : null,
            cat != null ? cat.getName() : null,
            event.getPriceJod(),
            event.getCurrency(),
            cover,
            event.getAverageRating(),
            event.getReviewCount(),
            event.isHidden(),
            true,
            favorite.getCreatedAt()
        );
    }

    private static String truncateDescription(String description) {
        if (!StringUtils.hasText(description)) {
            return description;
        }
        String t = description.trim();
        if (t.length() <= DESCRIPTION_PREVIEW_MAX) {
            return t;
        }
        return t.substring(0, DESCRIPTION_PREVIEW_MAX) + "…";
    }
}
