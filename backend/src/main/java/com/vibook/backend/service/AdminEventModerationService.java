package com.vibook.backend.service;

import com.vibook.backend.dto.AdminEventDetailPayload;
import com.vibook.backend.dto.AdminEventNotesRequest;
import com.vibook.backend.dto.AdminEventRowResponse;
import com.vibook.backend.dto.BusinessEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminEventModerationService {

    Page<AdminEventRowResponse> list(
        Long categoryId,
        Long governorateId,
        String visibility,
        String search,
        Pageable pageable
    );

    AdminEventDetailPayload getById(Long id);

    BusinessEventResponse hide(Long id);

    BusinessEventResponse show(Long id);

    void delete(Long id);

    void updateNotes(Long id, AdminEventNotesRequest request);
}
