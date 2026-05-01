package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.RejectBusinessProfileRequest;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.BusinessProfileMapper;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.service.AdminBusinessProfileService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBusinessProfileServiceImpl implements AdminBusinessProfileService {

    private final BusinessProfileRepository businessProfileRepository;
    private final BusinessProfileMapper businessProfileMapper;

    public AdminBusinessProfileServiceImpl(
        BusinessProfileRepository businessProfileRepository,
        BusinessProfileMapper businessProfileMapper
    ) {
        this.businessProfileRepository = businessProfileRepository;
        this.businessProfileMapper = businessProfileMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessProfileResponse> listProfiles(BusinessProfileStatus status, Pageable pageable) {
        if (status == null) {
            return businessProfileRepository.findAll(pageable).map(businessProfileMapper::toResponse);
        }
        return businessProfileRepository.findByStatus(status, pageable).map(businessProfileMapper::toResponse);
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
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (entity.getStatus() != BusinessProfileStatus.PENDING_REVIEW) {
            throw new BadRequestException("Only profiles pending review can be approved");
        }
        entity.setStatus(BusinessProfileStatus.APPROVED);
        entity.setRejectionReason(null);
        return businessProfileMapper.toResponse(businessProfileRepository.save(entity));
    }

    @Override
    @Transactional
    public BusinessProfileResponse reject(Long id, RejectBusinessProfileRequest request) {
        BusinessProfile entity = businessProfileRepository
            .findById(id)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        if (entity.getStatus() != BusinessProfileStatus.PENDING_REVIEW) {
            throw new BadRequestException("Only profiles pending review can be rejected");
        }
        entity.setStatus(BusinessProfileStatus.REJECTED);
        if (request != null && StringUtils.hasText(request.reason())) {
            entity.setRejectionReason(request.reason().trim());
        } else {
            entity.setRejectionReason(null);
        }
        return businessProfileMapper.toResponse(businessProfileRepository.save(entity));
    }
}
