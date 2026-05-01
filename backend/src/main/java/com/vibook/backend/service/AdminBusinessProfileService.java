package com.vibook.backend.service;

import com.vibook.backend.dto.BusinessProfileAdminNotesRequest;
import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BulkBusinessProfileRejectRequest;
import com.vibook.backend.dto.RejectBusinessProfileRequest;
import com.vibook.backend.entity.BusinessProfileStatus;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminBusinessProfileService {

    Page<BusinessProfileResponse> listProfiles(
        BusinessProfileStatus status,
        Long categoryId,
        Long governorateId,
        Instant createdFrom,
        Instant createdTo,
        Pageable pageable
    );

    BusinessProfileResponse getProfile(Long id);

    BusinessProfileResponse approve(Long id);

    BusinessProfileResponse reject(Long id, RejectBusinessProfileRequest request);

    List<BusinessProfileResponse> bulkApprove(List<Long> ids);

    List<BusinessProfileResponse> bulkReject(BulkBusinessProfileRejectRequest request);

    BusinessProfileResponse updateAdminNotes(Long id, BusinessProfileAdminNotesRequest request);
}
