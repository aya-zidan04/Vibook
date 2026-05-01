package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.RejectBusinessProfileRequest;
import com.vibook.backend.entity.BusinessProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminBusinessProfileService {

    Page<BusinessProfileResponse> listProfiles(BusinessProfileStatus status, Pageable pageable);

    BusinessProfileResponse getProfile(Long id);

    BusinessProfileResponse approve(Long id);

    BusinessProfileResponse reject(Long id, RejectBusinessProfileRequest request);
}
