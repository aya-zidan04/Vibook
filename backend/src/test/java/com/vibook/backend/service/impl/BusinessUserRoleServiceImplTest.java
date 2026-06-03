package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.repository.RoleRepository;
import com.vibook.backend.repository.UserRepository;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BusinessUserRoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BusinessUserRoleServiceImpl service;

    private User user;
    private Role roleUser;
    private Role roleBusiness;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setRoles(new HashSet<>());

        roleUser = new Role();
        roleUser.setName(RoleName.ROLE_USER);

        roleBusiness = new Role();
        roleBusiness.setName(RoleName.ROLE_BUSINESS);
    }

    @Test
    void grantBusinessRole_addsUserAndBusinessRoles() {
        when(roleRepository.findByName(RoleName.ROLE_BUSINESS)).thenReturn(Optional.of(roleBusiness));
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(roleUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.grantBusinessRole(user);

        assertThat(user.getRoles()).extracting(Role::getName).containsExactlyInAnyOrder(RoleName.ROLE_USER, RoleName.ROLE_BUSINESS);
        verify(userRepository).save(user);
    }

    @Test
    void revokeBusinessRole_removesBusinessOnly() {
        user.setRoles(new HashSet<>(Set.of(roleUser, roleBusiness)));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        service.revokeBusinessRole(user);

        assertThat(user.getRoles()).extracting(Role::getName).containsExactly(RoleName.ROLE_USER);
    }
}
