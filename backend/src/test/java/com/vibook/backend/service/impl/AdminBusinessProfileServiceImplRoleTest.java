package com.vibook.backend.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibook.backend.entity.BusinessProfile;
import com.vibook.backend.entity.BusinessProfileStatus;
import com.vibook.backend.entity.User;
import com.vibook.backend.mapper.BusinessProfileMapper;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminActivityLogService;
import com.vibook.backend.service.BusinessUserRoleService;
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
class AdminBusinessProfileServiceImplRoleTest {

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    @Mock
    private BusinessProfileMapper businessProfileMapper;

    @Mock
    private AdminActivityLogService adminActivityLogService;

    @Mock
    private BusinessUserRoleService businessUserRoleService;

    private AdminBusinessProfileServiceImpl service;

    private User owner;

    @BeforeEach
    void setUp() {
        service = new AdminBusinessProfileServiceImpl(
            businessProfileRepository,
            businessProfileMapper,
            adminActivityLogService,
            new ObjectMapper(),
            businessUserRoleService,
            null
        );

        owner = new User();
        owner.setId(10L);
        owner.setEmail("owner@example.com");

        User admin = new User();
        admin.setId(99L);
        admin.setEmail("admin@example.com");
        SecurityContextHolder.getContext()
            .setAuthentication(new UsernamePasswordAuthenticationToken(new AuthenticatedUser(admin), null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void approve_grantsBusinessRoleToProfileOwner() {
        BusinessProfile profile = new BusinessProfile();
        profile.setId(5L);
        profile.setUser(owner);
        profile.setStatus(BusinessProfileStatus.PENDING_REVIEW);

        when(businessProfileRepository.findById(5L)).thenReturn(Optional.of(profile));
        when(businessProfileRepository.save(any(BusinessProfile.class))).thenAnswer(inv -> inv.getArgument(0));
        when(businessProfileMapper.toResponse(any())).thenReturn(null);

        service.approve(5L);

        verify(businessUserRoleService).grantBusinessRole(eq(owner));
    }
}
