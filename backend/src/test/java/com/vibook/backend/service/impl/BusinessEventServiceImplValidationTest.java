package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventUpsertRequest;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.entity.Subcategory;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class BusinessEventServiceImplValidationTest {

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
    private BusinessProfile approvedProfile;
    private Subcategory subcategory;
    private Governorate governorate;

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

        Category category = new Category();
        category.setId(10L);
        category.setActive(true);
        subcategory = new Subcategory();
        subcategory.setId(1L);
        subcategory.setActive(true);
        subcategory.setCategory(category);
        governorate = new Governorate();
        governorate.setId(2L);
        governorate.setActive(true);

        approvedProfile = new BusinessProfile();
        approvedProfile.setId(9L);
        approvedProfile.setUser(owner);
        approvedProfile.setBusinessName("Cafe");
        approvedProfile.setPrimaryCategory(category);
        approvedProfile.setGovernorate(governorate);
        approvedProfile.setStatus(BusinessProfileStatus.APPROVED);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void create_rejectsPastEventDate() {
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(governorateRepository.findById(2L)).thenReturn(Optional.of(governorate));

        BusinessEventUpsertRequest request = validRequest(LocalDate.now().minusDays(1), true, null);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("past");
        verify(businessEventRepository, never()).save(any());
    }

    @Test
    void create_rejectsMoreThanTwelvePhotos() {
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(governorateRepository.findById(2L)).thenReturn(Optional.of(governorate));

        List<String> urls = IntStream.range(0, 13).mapToObj(i -> "/api/v1/files/business-events/p" + i + ".jpg").toList();
        BusinessEventUpsertRequest request = validRequest(LocalDate.now().plusDays(1), true, urls);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("12");
        verify(businessEventRepository, never()).save(any());
    }

    @Test
    void create_visibleWithoutPhotos_rejected() {
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(governorateRepository.findById(2L)).thenReturn(Optional.of(governorate));

        BusinessEventUpsertRequest request = validRequest(LocalDate.now().plusDays(1), false, null);

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("photo");
        verify(businessEventRepository, never()).save(any());
    }

    @Test
    void create_hiddenWithoutPhotos_allowed() {
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(governorateRepository.findById(2L)).thenReturn(Optional.of(governorate));
        when(businessEventRepository.save(any(BusinessEvent.class))).thenAnswer(inv -> {
            BusinessEvent e = inv.getArgument(0);
            e.setId(42L);
            return e;
        });
        when(businessEventRepository.findWithDetailsById(42L)).thenAnswer(inv -> {
            BusinessEvent e = new BusinessEvent();
            e.setId(42L);
            e.setBusinessProfile(approvedProfile);
            e.setPhotos(new ArrayList<>());
            return Optional.of(e);
        });
        when(eventRatingService.attachViewerRatingFields(any(), any())).thenReturn(mockResponse());

        service.create(validRequest(LocalDate.now().plusDays(1), true, null));

        verify(businessEventRepository).save(any(BusinessEvent.class));
    }

    @Test
    void update_blocksWhenProfileNotApproved() {
        BusinessProfile draftProfile = new BusinessProfile();
        draftProfile.setId(9L);
        draftProfile.setUser(owner);
        draftProfile.setStatus(BusinessProfileStatus.DRAFT);

        BusinessEvent event = new BusinessEvent();
        event.setId(5L);
        event.setBusinessProfile(draftProfile);
        event.setPhotos(new ArrayList<>());

        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(draftProfile));

        assertThatThrownBy(() -> service.update(5L, validRequest(LocalDate.now().plusDays(1), true, null)))
            .isInstanceOf(ForbiddenException.class)
            .hasMessageContaining("only after admin approval");
    }

    @Test
    void update_preservesPhotosWhenPhotoUrlsOmitted() {
        BusinessEventPhoto existing = new BusinessEventPhoto();
        existing.setId(7L);
        existing.setImageUrl("/api/v1/files/business-events/keep.jpg");
        existing.setSortOrder(0);

        BusinessEvent event = new BusinessEvent();
        event.setId(5L);
        event.setBusinessProfile(approvedProfile);
        event.setHidden(true);
        event.setPhotos(new ArrayList<>(List.of(existing)));
        existing.setBusinessEvent(event);

        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));
        when(subcategoryRepository.findById(1L)).thenReturn(Optional.of(subcategory));
        when(governorateRepository.findById(2L)).thenReturn(Optional.of(governorate));
        when(businessEventRepository.save(any(BusinessEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(eventRatingService.attachViewerRatingFields(any(), any())).thenReturn(mockResponse());

        service.update(5L, validRequest(LocalDate.now().plusDays(1), true, null));

        assertThat(event.getPhotos()).hasSize(1);
        assertThat(event.getPhotos().get(0).getImageUrl()).contains("keep.jpg");
    }

    @Test
    void uploadPhoto_rejectsWhenAlreadyAtMax() {
        BusinessEvent event = new BusinessEvent();
        event.setId(5L);
        event.setBusinessProfile(approvedProfile);
        ArrayList<BusinessEventPhoto> photos = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            BusinessEventPhoto p = new BusinessEventPhoto();
            p.setId((long) i);
            p.setSortOrder(i);
            p.setImageUrl("/api/v1/files/business-events/p" + i + ".jpg");
            photos.add(p);
        }
        event.setPhotos(photos);

        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(approvedProfile));

        MockMultipartFile file = new MockMultipartFile("image", "a.jpg", "image/jpeg", new byte[] { 1 });
        assertThatThrownBy(() -> service.uploadPhoto(5L, file))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("12");
    }

    private static BusinessEventUpsertRequest validRequest(
        LocalDate eventDate,
        boolean hidden,
        List<String> photoUrls
    ) {
        return new BusinessEventUpsertRequest(
            "Summer brunch",
            1L,
            "A long enough description for validation.",
            eventDate,
            List.of("10:00 AM"),
            2L,
            null,
            BigDecimal.ZERO,
            "JOD",
            20,
            hidden,
            photoUrls
        );
    }

    private static BusinessEventResponse mockResponse() {
        return new BusinessEventResponse(
            42L,
            9L,
            "Test Biz",
            "Summer brunch",
            1L,
            "Sub",
            10L,
            "Cat",
            "A long enough description for validation.",
            LocalDate.now().plusDays(1),
            List.of("10:00 AM"),
            List.of(),
            2L,
            "Amman",
            null,
            BigDecimal.ZERO,
            "JOD",
            20,
            20,
            true,
            0.0,
            0,
            List.of(),
            List.of(),
            null,
            null,
            null,
            null,
            null
        );
    }
}
