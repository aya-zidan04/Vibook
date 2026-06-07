package com.vibook.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibook.backend.dto.BusinessProfileAdminNotesRequest;
import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BulkBusinessProfileRejectRequest;
import com.vibook.backend.dto.RejectBusinessProfileRequest;
import com.vibook.backend.entity.AdminActivityAction;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.BusinessProfileMapper;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminActivityLogService;
import com.vibook.backend.service.AdminBusinessProfileService;
import com.vibook.backend.service.BusinessUserRoleService;
import com.vibook.backend.spec.BusinessProfileAdminSpecs;
import com.vibook.backend.util.AdminSecurityUtils;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBusinessProfileServiceImpl implements AdminBusinessProfileService {

    private static final String ENTITY_BUSINESS_PROFILE = "BUSINESS_PROFILE";

    private final BusinessProfileRepository businessProfileRepository;
    private final BusinessProfileMapper businessProfileMapper;
    private final AdminActivityLogService adminActivityLogService;
    private final ObjectMapper objectMapper;
    private final BusinessUserRoleService businessUserRoleService;
    private final AdminBusinessProfileService self;

    public AdminBusinessProfileServiceImpl(
        BusinessProfileRepository businessProfileRepository,
        BusinessProfileMapper businessProfileMapper,
        AdminActivityLogService adminActivityLogService,
        ObjectMapper objectMapper,
        BusinessUserRoleService businessUserRoleService,
        @Lazy AdminBusinessProfileService self
    ) {
        this.businessProfileRepository = businessProfileRepository;
        this.businessProfileMapper = businessProfileMapper;
        this.adminActivityLogService = adminActivityLogService;
        this.objectMapper = objectMapper;
        this.businessUserRoleService = businessUserRoleService;
        this.self = self;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessProfileResponse> listProfiles(
        BusinessProfileStatus status,
        Long categoryId,
        Long governorateId,
        Instant createdFrom,
        Instant createdTo,
        Pageable pageable
    ) {
        var spec = BusinessProfileAdminSpecs.withFilters(status, categoryId, governorateId, createdFrom, createdTo);
        return businessProfileRepository.findAll(spec, pageable).map(businessProfileMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessProfileResponse getProfile(Long id) {
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        return businessProfileMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public BusinessProfileResponse approve(Long id) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (entity.getStatus() != BusinessProfileStatus.PENDING_REVIEW) {
            throw new BadRequestException("Only profiles pending review can be approved");
        }
        entity.setStatus(BusinessProfileStatus.APPROVED);
        entity.setRejectionReason(null);
        entity.setApprovedAt(Instant.now());
        entity.setRejectedAt(null);
        entity.setRequiresReApproval(false);
        entity.setPreviouslyApproved(true);
        BusinessProfile saved = businessProfileRepository.save(entity);
        businessUserRoleService.grantBusinessRole(saved.getUser());
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.APPROVE_BUSINESS_PROFILE,
            ENTITY_BUSINESS_PROFILE,
            id,
            null
        );
        return businessProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BusinessProfileResponse reject(Long id, RejectBusinessProfileRequest request) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (entity.getStatus() != BusinessProfileStatus.PENDING_REVIEW) {
            throw new BadRequestException("Only profiles pending review can be rejected");
        }
        entity.setStatus(BusinessProfileStatus.REJECTED);
        String reason = null;
        if (request != null && StringUtils.hasText(request.reason())) {
            reason = request.reason().trim();
            entity.setRejectionReason(reason);
        } else {
            entity.setRejectionReason(null);
        }
        entity.setRejectedAt(Instant.now());
        entity.setApprovedAt(null);
        entity.setRequiresReApproval(false);
        BusinessProfile saved = businessProfileRepository.save(entity);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.REJECT_BUSINESS_PROFILE,
            ENTITY_BUSINESS_PROFILE,
            id,
            toJsonDetails(Map.of("reason", reason != null ? reason : ""))
        );
        return businessProfileMapper.toResponse(saved);
    }

    @Override
    public List<BusinessProfileResponse> bulkApprove(List<Long> ids) {
        List<BusinessProfileResponse> out = new ArrayList<>();
        for (Long id : ids) {
            try {
                out.add(self.approve(id));
            } catch (BadRequestException | NotFoundException ignored) {
                // skip non-actionable rows for bulk
            }
        }
        return out;
    }

    @Override
    public List<BusinessProfileResponse> bulkReject(BulkBusinessProfileRejectRequest request) {
        List<BusinessProfileResponse> out = new ArrayList<>();
        String reason = request.reason() != null ? request.reason().trim() : null;
        for (Long id : request.ids()) {
            try {
                out.add(self.reject(id, new RejectBusinessProfileRequest(reason)));
            } catch (BadRequestException | NotFoundException ignored) {
                // skip
            }
        }
        return out;
    }

    @Override
    @Transactional
    public BusinessProfileResponse updateAdminNotes(Long id, BusinessProfileAdminNotesRequest request) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        String notes = request.notes() != null ? request.notes().trim() : "";
        entity.setAdminNotes(notes.isEmpty() ? null : notes);
        BusinessProfile saved = businessProfileRepository.save(entity);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.UPDATE_BUSINESS_NOTES,
            ENTITY_BUSINESS_PROFILE,
            id,
            null
        );
        return businessProfileMapper.toResponse(saved);
    }

    private String toJsonDetails(Map<String, String> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return map.toString();
        }
    }
}
