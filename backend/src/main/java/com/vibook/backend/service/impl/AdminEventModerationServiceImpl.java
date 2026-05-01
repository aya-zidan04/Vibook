package com.vibook.backend.service.impl;

import com.vibook.backend.dto.AdminEventDetailPayload;
import com.vibook.backend.dto.AdminEventNotesRequest;
import com.vibook.backend.dto.AdminEventRowResponse;
import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.service.AdminEventModerationService;
import com.vibook.backend.service.BusinessEventService;
import com.vibook.backend.service.EventRatingService;
import com.vibook.backend.spec.AdminBusinessEventSpecs;
import com.vibook.backend.util.AdminSecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminEventModerationServiceImpl implements AdminEventModerationService {

    private final BusinessEventRepository businessEventRepository;
    private final BusinessEventMapper businessEventMapper;
    private final BusinessEventService businessEventService;
    private final EventRatingService eventRatingService;

    public AdminEventModerationServiceImpl(
        BusinessEventRepository businessEventRepository,
        BusinessEventMapper businessEventMapper,
        BusinessEventService businessEventService,
        EventRatingService eventRatingService
    ) {
        this.businessEventRepository = businessEventRepository;
        this.businessEventMapper = businessEventMapper;
        this.businessEventService = businessEventService;
        this.eventRatingService = eventRatingService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminEventRowResponse> list(
        Long categoryId,
        Long governorateId,
        String visibility,
        String search,
        Pageable pageable
    ) {
        var spec = AdminBusinessEventSpecs.withFilters(categoryId, governorateId, visibility, search);
        return businessEventRepository.findAll(spec, pageable).map(businessEventMapper::toAdminRow);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminEventDetailPayload getById(Long id) {
        BusinessEvent event = businessEventRepository
            .findWithDetailsById(id)
            .orElseThrow(() -> new NotFoundException("Event not found"));
        String email = AdminSecurityUtils.requireAuthenticatedUser().getUsername();
        BusinessEventResponse body = eventRatingService.attachViewerRatingFields(event, email);
        return new AdminEventDetailPayload(body, event.getAdminNotes());
    }

    @Override
    @Transactional
    public BusinessEventResponse hide(Long id) {
        return businessEventService.hide(id);
    }

    @Override
    @Transactional
    public BusinessEventResponse show(Long id) {
        return businessEventService.unhide(id);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        businessEventService.delete(id);
    }

    @Override
    @Transactional
    public void updateNotes(Long id, AdminEventNotesRequest request) {
        BusinessEvent event = businessEventRepository.findById(id).orElseThrow(() -> new NotFoundException("Event not found"));
        String notes = request.notes() != null ? request.notes().trim() : "";
        event.setAdminNotes(notes.isEmpty() ? null : notes);
        businessEventRepository.save(event);
    }
}
