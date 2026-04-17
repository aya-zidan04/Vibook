package com.vibook.backend.mapper;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.Subcategory;
import org.springframework.stereotype.Component;

@Component
public class BusinessEventMapper {

    public BusinessEventResponse toResponse(BusinessEvent entity) {
        return toResponse(entity, null, null);
    }

    public BusinessEventResponse toResponse(BusinessEvent entity, Integer myRating, Boolean canRate) {
        Subcategory sub = entity.getSubcategory();
        Category cat = sub != null ? sub.getCategory() : null;
        Governorate gov = entity.getGovernorate();
        return new BusinessEventResponse(
            entity.getId(),
            entity.getBusinessProfile().getId(),
            entity.getTitle(),
            sub != null ? sub.getId() : null,
            sub != null ? sub.getName() : null,
            cat != null ? cat.getId() : null,
            cat != null ? cat.getName() : null,
            entity.getDescription(),
            entity.getEventDate(),
            entity.getTimeSlots().stream().map(BusinessEventTimeSlot::getSlotLabel).toList(),
            gov != null ? gov.getId() : null,
            gov != null ? gov.getName() : null,
            entity.getGoogleMapsUrl(),
            entity.getPriceJod(),
            entity.getCurrency(),
            entity.getCapacityGuests(),
            entity.isHidden(),
            entity.getAverageRating(),
            entity.getReviewCount(),
            entity.getPhotos().stream().map(BusinessEventPhoto::getImageUrl).toList(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            myRating,
            canRate
        );
    }

    public BusinessEventSummaryResponse toSummary(BusinessEvent entity) {
        Subcategory sub = entity.getSubcategory();
        Governorate gov = entity.getGovernorate();
        String primaryPhoto = entity.getPhotos().isEmpty() ? null : entity.getPhotos().get(0).getImageUrl();
        return new BusinessEventSummaryResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getEventDate(),
            entity.isHidden(),
            entity.getPriceJod(),
            entity.getCurrency(),
            entity.getCapacityGuests(),
            gov != null ? gov.getName() : null,
            sub != null ? sub.getName() : null,
            primaryPhoto,
            entity.getAverageRating(),
            entity.getReviewCount(),
            entity.getCreatedAt()
        );
    }
}
