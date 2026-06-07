package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.vibook.backend.dto.BusinessEventUpsertRequest;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.ForbiddenException;
import com.vibook.backend.mapper.BusinessEventMapper;
import com.vibook.backend.repository.BusinessEventPhotoRepository;
import com.vibook.backend.repository.BusinessEventRepository;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.repository.SubcategoryRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.EventRatingService;
import com.vibook.backend.service.ProfileImageStorageService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class BusinessEventServiceImplManagementGuardTest {

    @Mock
    private BusinessEventRepository businessEventRepository;
    @Mock
    private BusinessEventPhotoRepository businessEventPhotoRepository;
    @Mock
    private BusinessProfileRepository businessProfileRepository;
    @Mock
    private SubcategoryRepository subcategoryRepository;
    @Mock
    private GovernorateRepository governorateRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BusinessEventMapper businessEventMapper;
    @Mock
    private EventRatingService eventRatingService;
    @Mock
    private ProfileImageStorageService profileImageStorageService;

    private BusinessEventServiceImpl service;
    private User owner;

    @BeforeEach
    void setUp() {
        service = new BusinessEventServiceImpl(
            businessEventRepository,
            businessEventPhotoRepository,
            businessProfileRepository,
            subcategoryRepository,
            governorateRepository,
            userRepository,
            businessEventMapper,
            eventRatingService,
            profileImageStorageService
        );
        owner = new User();
        owner.setId(3L);
        owner.setEmail("owner@example.com");
        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(owner), null));
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(owner));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void create_blocksWhenProfileIsNotApproved() {
        BusinessProfile profile = draftProfile();
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(profile));

        assertThatThrownBy(() -> service.create(sampleRequest()))
            .isInstanceOf(ForbiddenException.class)
            .hasMessageContaining("only after admin approval");
    }

    private BusinessProfile draftProfile() {
        Category category = new Category();
        category.setId(1L);
        category.setActive(true);
        Governorate governorate = new Governorate();
        governorate.setId(2L);
        governorate.setActive(true);
        BusinessProfile profile = new BusinessProfile();
        profile.setId(9L);
        profile.setUser(owner);
        profile.setBusinessName("Cafe");
        profile.setPrimaryCategory(category);
        profile.setGovernorate(governorate);
        profile.setStatus(BusinessProfileStatus.DRAFT);
        profile.setRequiresReApproval(true);
        profile.setPreviouslyApproved(true);
        return profile;
    }

    private static BusinessEventUpsertRequest sampleRequest() {
        return new BusinessEventUpsertRequest(
            "Event",
            1L,
            "Long enough description for validation.",
            LocalDate.now().plusDays(3),
            List.of("10:00 AM"),
            2L,
            null,
            BigDecimal.TEN,
            "JOD",
            20,
            false,
            null
        );
    }
}
