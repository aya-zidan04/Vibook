package com.vibook.backend.mapper;

import com.vibook.backend.dto.AdminEventRowResponse;
import com.vibook.backend.dto.BusinessEventPhotoResponse;
import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.BusinessEventTimeSlotResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessEventTimeSlot;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.Subcategory;
import org.springframework.stereotype.Component;

@Component
public class BusinessEventMapper {

    public BusinessEventResponse toResponse(BusinessEvent entity, int remainingCapacity) {
        return toResponse(entity, null, null, null, remainingCapacity);
    }

    public BusinessEventResponse toResponse(BusinessEvent entity, Integer myRating, Long myRatingId, Boolean canRate, int remainingCapacity) {
        Subcategory sub = entity.getSubcategory();
        Category cat = sub != null ? sub.getCategory() : null;
        Governorate gov = entity.getGovernorate();
        return new BusinessEventResponse(
            entity.getId(),
            entity.getBusinessProfile().getId(),
            entity.getBusinessProfile().getBusinessName(),
            entity.getTitle(),
            sub != null ? sub.getId() : null,
            sub != null ? sub.getName() : null,
            cat != null ? cat.getId() : null,
            cat != null ? cat.getName() : null,
            entity.getDescription(),
            entity.getEventDate(),
            entity.getTimeSlots().stream().map(BusinessEventTimeSlot::getSlotLabel).toList(),
            entity
                .getTimeSlots()
                .stream()
                .map(s -> new BusinessEventTimeSlotResponse(s.getId(), s.getSlotLabel(), s.getSortOrder()))
                .toList(),
            gov != null ? gov.getId() : null,
            gov != null ? gov.getName() : null,
            entity.getGoogleMapsUrl(),
            entity.getPriceJod(),
            entity.getCurrency(),
            entity.getCapacityGuests(),
            remainingCapacity,
            entity.isHidden(),
            entity.getAverageRating(),
            entity.getReviewCount(),
            entity.getPhotos().stream().map(BusinessEventPhoto::getImageUrl).toList(),
            entity
                .getPhotos()
                .stream()
                .map(p -> new BusinessEventPhotoResponse(p.getId(), p.getImageUrl(), p.getSortOrder()))
                .toList(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            myRating,
            myRatingId,
            canRate
        );
    }

    public AdminEventRowResponse toAdminRow(BusinessEvent entity, int photoCount) {
        Subcategory sub = entity.getSubcategory();
        Category cat = sub != null ? sub.getCategory() : null;
        Governorate gov = entity.getGovernorate();
        String visibility = entity.isHidden() ? "HIDDEN" : "VISIBLE";
        return new AdminEventRowResponse(
            entity.getId(),
            entity.getTitle(),
            entity.getBusinessProfile().getId(),
            entity.getBusinessProfile().getBusinessName(),
            cat != null ? cat.getName() : null,
            sub != null ? sub.getName() : null,
            gov != null ? gov.getName() : null,
            entity.getEventDate(),
            entity.getTimeSlots().stream().map(BusinessEventTimeSlot::getSlotLabel).toList(),
            entity.getPriceJod(),
            entity.getCurrency(),
            entity.getCapacityGuests(),
            photoCount,
            visibility,
            entity.getCreatedAt()
        );
    }

    public BusinessEventSummaryResponse toSummary(BusinessEvent entity) {
        Subcategory sub = entity.getSubcategory();
        Category cat = sub != null ? sub.getCategory() : null;
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
            gov != null ? gov.getId() : null,
            gov != null ? gov.getName() : null,
            sub != null ? sub.getId() : null,
            sub != null ? sub.getName() : null,
            cat != null ? cat.getId() : null,
            cat != null ? cat.getName() : null,
            entity.getBusinessProfile().getBusinessName(),
            entity.getTimeSlots().stream().map(BusinessEventTimeSlot::getSlotLabel).toList(),
            entity.getDescription(),
            primaryPhoto,
            entity.getAverageRating(),
            entity.getReviewCount(),
            entity.getCreatedAt()
        );
    }
}
