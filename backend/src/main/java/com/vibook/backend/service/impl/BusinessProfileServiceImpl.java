package com.vibook.backend.service.impl;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BusinessProfileUpsertRequest;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.BusinessProfileMapper;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.CategoryRepository;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BusinessProfileService;
import com.vibook.backend.service.ProfileImageStorageService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BusinessProfileServiceImpl implements BusinessProfileService {

    private final BusinessProfileRepository businessProfileRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final GovernorateRepository governorateRepository;
    private final BusinessProfileMapper businessProfileMapper;
    private final ProfileImageStorageService profileImageStorageService;

    public BusinessProfileServiceImpl(
        BusinessProfileRepository businessProfileRepository,
        UserRepository userRepository,
        CategoryRepository categoryRepository,
        GovernorateRepository governorateRepository,
        BusinessProfileMapper businessProfileMapper,
        ProfileImageStorageService profileImageStorageService
    ) {
        this.businessProfileRepository = businessProfileRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.governorateRepository = governorateRepository;
        this.businessProfileMapper = businessProfileMapper;
        this.profileImageStorageService = profileImageStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessProfileResponse getMyProfile() {
        User user = getCurrentAuthenticatedUser();
        BusinessProfile profile = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
        return businessProfileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public BusinessProfileResponse upsertMyProfile(BusinessProfileUpsertRequest request) {
        User user = getCurrentAuthenticatedUser();
        Category category = categoryRepository
            .findById(request.primaryCategoryId())
            .filter(Category::isActive)
            .orElseThrow(() -> new NotFoundException("Category not found"));
        Governorate governorate = governorateRepository
            .findById(request.governorateId())
            .filter(Governorate::isActive)
            .orElseThrow(() -> new NotFoundException("Governorate not found"));

        BusinessProfile entity = businessProfileRepository
            .findByUser(user)
            .orElseGet(() -> {
                BusinessProfile created = new BusinessProfile();
                created.setUser(user);
                created.setStatus(BusinessProfileStatus.DRAFT);
                return created;
            });

        businessProfileMapper.updateEntity(entity, request, category, governorate);
        queueApprovedProfileForReapproval(entity);
        BusinessProfile saved = businessProfileRepository.save(entity);
        return businessProfileMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BusinessProfileResponse submitMyProfileForReview() {
        User user = getCurrentAuthenticatedUser();
        BusinessProfile entity = businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));

        if (entity.getStatus() != BusinessProfileStatus.DRAFT && entity.getStatus() != BusinessProfileStatus.REJECTED) {
            throw new BadRequestException("Only draft or rejected profiles can be submitted for review");
        }

        validateReadyForReview(entity);

        entity.setStatus(BusinessProfileStatus.PENDING_REVIEW);
        entity.setRejectionReason(null);
        entity.setRejectedAt(null);
        BusinessProfile saved = businessProfileRepository.save(entity);
        return businessProfileMapper.toResponse(saved);
    }

    private static void validateReadyForReview(BusinessProfile p) {
        if (!org.springframework.util.StringUtils.hasText(p.getBusinessName())) {
            throw new BadRequestException("Business name is required before submission");
        }
        if (p.getPrimaryCategory() == null) {
            throw new BadRequestException("Primary category is required before submission");
        }
        if (p.getGovernorate() == null) {
            throw new BadRequestException("Governorate is required before submission");
        }
        if (!org.springframework.util.StringUtils.hasText(p.getPhone()) && !org.springframework.util.StringUtils.hasText(p.getWorkEmail())) {
            throw new BadRequestException("Work phone or work email is required before submission");
        }
        if (!org.springframework.util.StringUtils.hasText(p.getDescription())) {
            throw new BadRequestException("Description is required before submission");
        }
    }

    @Override
    @Transactional
    public BusinessProfileResponse uploadLogo(MultipartFile image) {
        BusinessProfile profile = requireProfileForCurrentUser();
        String previous = profile.getLogoImageUrl();
        String publicPath = profileImageStorageService.saveBusinessLogo(image);
        if (StringUtils.hasText(previous)) {
            profileImageStorageService.tryDeleteStoredFile(previous);
        }
        profile.setLogoImageUrl(publicPath);
        queueApprovedProfileForReapproval(profile);
        return businessProfileMapper.toResponse(businessProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public BusinessProfileResponse deleteLogo() {
        BusinessProfile profile = requireProfileForCurrentUser();
        if (StringUtils.hasText(profile.getLogoImageUrl())) {
            profileImageStorageService.tryDeleteStoredFile(profile.getLogoImageUrl());
        }
        profile.setLogoImageUrl(null);
        queueApprovedProfileForReapproval(profile);
        return businessProfileMapper.toResponse(businessProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public BusinessProfileResponse uploadBanner(MultipartFile image) {
        BusinessProfile profile = requireProfileForCurrentUser();
        String previous = profile.getBannerImageUrl();
        String publicPath = profileImageStorageService.saveBusinessBanner(image);
        if (StringUtils.hasText(previous)) {
            profileImageStorageService.tryDeleteStoredFile(previous);
        }
        profile.setBannerImageUrl(publicPath);
        queueApprovedProfileForReapproval(profile);
        return businessProfileMapper.toResponse(businessProfileRepository.save(profile));
    }

    @Override
    @Transactional
    public BusinessProfileResponse deleteBanner() {
        BusinessProfile profile = requireProfileForCurrentUser();
        if (StringUtils.hasText(profile.getBannerImageUrl())) {
            profileImageStorageService.tryDeleteStoredFile(profile.getBannerImageUrl());
        }
        profile.setBannerImageUrl(null);
        queueApprovedProfileForReapproval(profile);
        return businessProfileMapper.toResponse(businessProfileRepository.save(profile));
    }

    /**
     * Approved profiles go straight to pending review after owner edits (re-approval queue).
     * {@code ROLE_BUSINESS} is preserved; admin reject does not revoke it (see {@code AdminBusinessProfileServiceImpl#reject}).
     */
    private static void queueApprovedProfileForReapproval(BusinessProfile entity) {
        if (entity.getStatus() != BusinessProfileStatus.APPROVED) {
            return;
        }
        validateReadyForReview(entity);
        entity.setStatus(BusinessProfileStatus.PENDING_REVIEW);
        entity.setRejectionReason(null);
        entity.setRejectedAt(null);
        entity.setRequiresReApproval(true);
    }

    private BusinessProfile requireProfileForCurrentUser() {
        User user = getCurrentAuthenticatedUser();
        return businessProfileRepository
            .findByUser(user)
            .orElseThrow(() -> new NotFoundException("Business profile not found"));
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new UnauthorizedException("Unauthorized");
        }
        return userRepository
            .findByEmail(principal.getUsername())
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
    }
}
