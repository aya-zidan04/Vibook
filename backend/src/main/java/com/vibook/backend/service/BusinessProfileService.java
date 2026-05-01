package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BusinessProfileUpsertRequest;
import org.springframework.web.multipart.MultipartFile;

public interface BusinessProfileService {

    BusinessProfileResponse getMyProfile();

    BusinessProfileResponse upsertMyProfile(BusinessProfileUpsertRequest request);

    BusinessProfileResponse uploadLogo(MultipartFile image);

    BusinessProfileResponse deleteLogo();

    BusinessProfileResponse uploadBanner(MultipartFile image);

    BusinessProfileResponse deleteBanner();

    /** Moves {@link com.vibook.backend.entity.BusinessProfileStatus#DRAFT} or {@code REJECTED} to {@code PENDING_REVIEW}. */
    BusinessProfileResponse submitMyProfileForReview();
}
