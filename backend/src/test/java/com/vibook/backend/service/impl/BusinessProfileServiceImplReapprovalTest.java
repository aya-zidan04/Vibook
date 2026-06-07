package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BusinessProfileUpsertRequest;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.User;
import com.vibook.backend.mapper.BusinessProfileMapper;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.CategoryRepository;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.ProfileImageStorageService;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BusinessProfileServiceImplReapprovalTest {

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private GovernorateRepository governorateRepository;

    @Mock
    private BusinessProfileMapper businessProfileMapper;

    @Mock
    private ProfileImageStorageService profileImageStorageService;

    private BusinessProfileServiceImpl service;

    private User owner;
    private Category category;
    private Governorate governorate;

    @BeforeEach
    void setUp() {
        service = new BusinessProfileServiceImpl(
            businessProfileRepository,
            userRepository,
            categoryRepository,
            governorateRepository,
            businessProfileMapper,
            profileImageStorageService
        );

        owner = new User();
        owner.setId(7L);
        owner.setEmail("owner@example.com");

        category = new Category();
        category.setId(1L);
        category.setName("Food");
        category.setActive(true);

        governorate = new Governorate();
        governorate.setId(5L);
        governorate.setName("Amman");
        governorate.setActive(true);

        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(owner), null));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(governorateRepository.findById(5L)).thenReturn(Optional.of(governorate));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void upsertMyProfile_queuesApprovedProfileForReapprovalAsPendingReview() {
        BusinessProfile profile = approvedProfile();
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(profile));
        when(businessProfileRepository.save(any(BusinessProfile.class))).thenAnswer(inv -> inv.getArgument(0));
        when(businessProfileMapper.toResponse(any(BusinessProfile.class)))
            .thenAnswer(inv -> {
                BusinessProfile p = inv.getArgument(0);
                return new BusinessProfileResponse(
                    p.getId(),
                    p.getBusinessName(),
                    null,
                    null,
                    null,
                    1L,
                    "Food",
                    "Desc",
                    null,
                    "0790000000",
                    5L,
                    "Amman",
                    null,
                    null,
                    p.getStatus(),
                    p.getCreatedAt(),
                    p.getUpdatedAt(),
                    null,
                    owner.getEmail(),
                    owner.getId(),
                    null,
                    p.getApprovedAt(),
                    null,
                    p.isRequiresReApproval(),
                    p.isPreviouslyApproved()
                );
            });

        BusinessProfileResponse response = service.upsertMyProfile(sampleRequest());

        ArgumentCaptor<BusinessProfile> captor = ArgumentCaptor.forClass(BusinessProfile.class);
        verify(businessProfileRepository).save(captor.capture());
        BusinessProfile saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
        assertThat(saved.isRequiresReApproval()).isTrue();
        assertThat(saved.getApprovedAt()).isNotNull();
        assertThat(response.status()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
        assertThat(response.requiresReApproval()).isTrue();
    }

    @Test
    void submitMyProfileForReview_keepsRequiresReApprovalFlagForRejectedResubmit() {
        BusinessProfile profile = approvedProfile();
        profile.setStatus(BusinessProfileStatus.REJECTED);
        profile.setRequiresReApproval(false);
        profile.setPreviouslyApproved(true);
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(profile));
        when(businessProfileRepository.save(any(BusinessProfile.class))).thenAnswer(inv -> inv.getArgument(0));
        when(businessProfileMapper.toResponse(any(BusinessProfile.class)))
            .thenAnswer(inv -> {
                BusinessProfile p = inv.getArgument(0);
                return new BusinessProfileResponse(
                    p.getId(),
                    p.getBusinessName(),
                    null,
                    null,
                    null,
                    1L,
                    "Food",
                    "Desc",
                    null,
                    "0790000000",
                    5L,
                    "Amman",
                    null,
                    null,
                    p.getStatus(),
                    p.getCreatedAt(),
                    p.getUpdatedAt(),
                    null,
                    owner.getEmail(),
                    owner.getId(),
                    null,
                    p.getApprovedAt(),
                    null,
                    p.isRequiresReApproval(),
                    p.isPreviouslyApproved()
                );
            });

        BusinessProfileResponse response = service.submitMyProfileForReview();

        ArgumentCaptor<BusinessProfile> captor = ArgumentCaptor.forClass(BusinessProfile.class);
        verify(businessProfileRepository).save(captor.capture());
        BusinessProfile saved = captor.getValue();
        assertThat(saved.getStatus()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
        assertThat(saved.isRequiresReApproval()).isFalse();
        assertThat(response.status()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
    }

    @Test
    void uploadLogo_queuesApprovedProfileForReapprovalAsPendingReview() {
        BusinessProfile profile = approvedProfile();
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(profile));
        when(businessProfileRepository.save(any(BusinessProfile.class))).thenAnswer(inv -> inv.getArgument(0));
        when(profileImageStorageService.saveBusinessLogo(any())).thenReturn("/api/v1/files/business-logos/x.png");
        when(businessProfileMapper.toResponse(any(BusinessProfile.class)))
            .thenReturn(new BusinessProfileResponse(
                1L,
                "Cafe",
                null,
                null,
                "/api/v1/files/business-logos/x.png",
                1L,
                "Food",
                "Desc",
                null,
                "0790000000",
                5L,
                "Amman",
                null,
                null,
                BusinessProfileStatus.PENDING_REVIEW,
                Instant.now(),
                Instant.now(),
                null,
                owner.getEmail(),
                owner.getId(),
                null,
                Instant.now(),
                null,
                true,
                true
            ));

        service.uploadLogo(org.mockito.Mockito.mock(MultipartFile.class));

        ArgumentCaptor<BusinessProfile> captor = ArgumentCaptor.forClass(BusinessProfile.class);
        verify(businessProfileRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(BusinessProfileStatus.PENDING_REVIEW);
        assertThat(captor.getValue().isRequiresReApproval()).isTrue();
        verify(profileImageStorageService).saveBusinessLogo(any());
    }

    private BusinessProfile approvedProfile() {
        BusinessProfile profile = new BusinessProfile();
        profile.setId(1L);
        profile.setUser(owner);
        profile.setBusinessName("Cafe");
        profile.setPrimaryCategory(category);
        profile.setGovernorate(governorate);
        profile.setDescription("Desc");
        profile.setPhone("0790000000");
        profile.setStatus(BusinessProfileStatus.APPROVED);
        profile.setApprovedAt(Instant.parse("2025-01-01T00:00:00Z"));
        profile.setPreviouslyApproved(true);
        profile.setCreatedAt(Instant.now());
        profile.setUpdatedAt(Instant.now());
        return profile;
    }

    private static BusinessProfileUpsertRequest sampleRequest() {
        return new BusinessProfileUpsertRequest(
            "Cafe Updated",
            null,
            1L,
            "Desc",
            null,
            "0790000000",
            5L,
            null,
            null
        );
    }
}
