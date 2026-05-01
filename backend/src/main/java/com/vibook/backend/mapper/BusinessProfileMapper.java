package com.vibook.backend.mapper;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BusinessProfileUpsertRequest;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.User;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class BusinessProfileMapper {

    public BusinessProfileResponse toResponse(BusinessProfile entity) {
        Category category = entity.getPrimaryCategory();
        Governorate governorate = entity.getGovernorate();
        User user = entity.getUser();
        return new BusinessProfileResponse(
            entity.getId(),
            entity.getBusinessName(),
            entity.getTagline(),
            entity.getBannerImageUrl(),
            entity.getLogoImageUrl(),
            category != null ? category.getId() : null,
            category != null ? category.getName() : null,
            entity.getDescription(),
            entity.getWorkEmail(),
            entity.getPhone(),
            governorate != null ? governorate.getId() : null,
            governorate != null ? governorate.getName() : null,
            entity.getGoogleMapsUrl(),
            entity.getWebsite(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getRejectionReason(),
            user != null ? user.getEmail() : null,
            user != null ? user.getId() : null,
            entity.getAdminNotes(),
            entity.getApprovedAt(),
            entity.getRejectedAt()
        );
    }

    public void updateEntity(
        BusinessProfile entity,
        BusinessProfileUpsertRequest request,
        Category category,
        Governorate governorate
    ) {
        entity.setBusinessName(request.businessName().trim());
        entity.setTagline(blankToNull(request.tagline()));
        entity.setPrimaryCategory(category);
        entity.setDescription(blankToNull(request.description()));
        entity.setWorkEmail(blankToNull(request.workEmail()));
        entity.setPhone(blankToNull(request.phone()));
        entity.setGovernorate(governorate);
        entity.setGoogleMapsUrl(blankToNull(request.googleMapsUrl()));
        entity.setWebsite(blankToNull(request.website()));
    }

    private static String blankToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
