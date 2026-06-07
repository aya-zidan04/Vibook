package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.entity.BusinessEventPhoto;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
class BusinessEventPhotoServiceImplTest {

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

    @InjectMocks
    private BusinessEventServiceImpl service;

    private User owner;
    private User otherUser;
    private User admin;
    private BusinessProfile ownerProfile;
    private BusinessEvent event;

    @BeforeEach
    void setUp() {
        owner = userWithRole(1L, "owner@test.com", RoleName.ROLE_USER);
        otherUser = userWithRole(2L, "other@test.com", RoleName.ROLE_USER);
        admin = userWithRole(99L, "admin@test.com", RoleName.ROLE_ADMIN);

        ownerProfile = new BusinessProfile();
        ownerProfile.setId(10L);
        ownerProfile.setUser(owner);
        ownerProfile.setStatus(BusinessProfileStatus.APPROVED);

        event = new BusinessEvent();
        event.setId(5L);
        event.setBusinessProfile(ownerProfile);
        event.setPhotos(new ArrayList<>());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadPhoto_ownerSucceeds() {
        loginAs(owner);
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(ownerProfile));
        when(profileImageStorageService.saveBusinessEventPhoto(any())).thenReturn("/api/v1/files/business-events/a.jpg");
        when(businessEventRepository.save(any(BusinessEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(eventRatingService.attachViewerRatingFields(any(), any())).thenReturn(mockResponse());

        MultipartFile file = new MockMultipartFile("image", "a.jpg", "image/jpeg", new byte[] { 1, 2, 3 });
        service.uploadPhoto(5L, file);

        assertThat(event.getPhotos()).hasSize(1);
        assertThat(event.getPhotos().get(0).getImageUrl()).contains("business-events");
        verify(profileImageStorageService).saveBusinessEventPhoto(file);
    }

    @Test
    void uploadPhoto_nonOwnerBlocked() {
        loginAs(otherUser);
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(otherUser)).thenReturn(Optional.of(new BusinessProfile()));

        MultipartFile file = new MockMultipartFile("image", "a.jpg", "image/jpeg", new byte[] { 1 });

        assertThatThrownBy(() -> service.uploadPhoto(5L, file)).isInstanceOf(AccessDeniedException.class);
        verify(profileImageStorageService, never()).saveBusinessEventPhoto(any());
    }

    @Test
    void deletePhoto_adminSucceeds() {
        loginAs(admin);
        BusinessEventPhoto photo = new BusinessEventPhoto();
        photo.setId(20L);
        photo.setBusinessEvent(event);
        photo.setImageUrl("/api/v1/files/business-events/x.png");
        photo.setSortOrder(0);
        event.getPhotos().add(photo);

        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessEventPhotoRepository.findByIdAndBusinessEvent_Id(20L, 5L)).thenReturn(Optional.of(photo));
        when(businessEventRepository.save(any(BusinessEvent.class))).thenAnswer(inv -> inv.getArgument(0));
        when(eventRatingService.attachViewerRatingFields(any(), any())).thenReturn(mockResponse());

        service.deletePhoto(5L, 20L);

        assertThat(event.getPhotos()).isEmpty();
        verify(profileImageStorageService).tryDeleteStoredFile(photo.getImageUrl());
    }

    @Test
    void uploadPhoto_invalidTypeRejected() {
        loginAs(owner);
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(ownerProfile));
        when(profileImageStorageService.saveBusinessEventPhoto(any())).thenThrow(new BadRequestException("Only JPEG, PNG, or WebP images are allowed"));

        MultipartFile file = new MockMultipartFile("image", "a.gif", "image/gif", new byte[] { 1 });

        assertThatThrownBy(() -> service.uploadPhoto(5L, file)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void uploadPhoto_oversizedRejected() {
        loginAs(owner);
        when(businessEventRepository.findWithDetailsById(5L)).thenReturn(Optional.of(event));
        when(businessProfileRepository.findByUser(owner)).thenReturn(Optional.of(ownerProfile));
        when(profileImageStorageService.saveBusinessEventPhoto(any())).thenThrow(new BadRequestException("Image file is too large"));

        MultipartFile file = new MockMultipartFile("image", "big.jpg", "image/jpeg", new byte[] { 1 });

        assertThatThrownBy(() -> service.uploadPhoto(5L, file)).isInstanceOf(BadRequestException.class);
    }

    private static User userWithRole(long id, String email, RoleName roleName) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        Role role = new Role();
        role.setName(roleName);
        u.setRoles(new HashSet<>(Set.of(role)));
        return u;
    }

    private void loginAs(User user) {
        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(user), null));
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
    }

    private static BusinessEventResponse mockResponse() {
        return new BusinessEventResponse(
            5L,
            10L,
            "E",
            1L,
            "Sub",
            1L,
            "Cat",
            "d",
            LocalDate.now(),
            List.of(),
            1L,
            "Amman",
            null,
            BigDecimal.TEN,
            "JOD",
            10,
            10,
            false,
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
