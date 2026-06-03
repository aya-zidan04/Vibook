package com.vibook.backend.service.impl;

import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.repository.RoleRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.BusinessUserRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusinessUserRoleServiceImpl implements BusinessUserRoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public BusinessUserRoleServiceImpl(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void grantBusinessRole(User user) {
        Role businessRole = roleRepository
            .findByName(RoleName.ROLE_BUSINESS)
            .orElseThrow(() -> new BadRequestException("ROLE_BUSINESS is not configured"));
        boolean hasUserRole = user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ROLE_USER);
        if (!hasUserRole) {
            Role userRole = roleRepository
                .findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new BadRequestException("ROLE_USER is not configured"));
            user.getRoles().add(userRole);
        }
        if (user.getRoles().stream().noneMatch(r -> r.getName() == RoleName.ROLE_BUSINESS)) {
            user.getRoles().add(businessRole);
        }
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void revokeBusinessRole(User user) {
        user.getRoles().removeIf(r -> r.getName() == RoleName.ROLE_BUSINESS);
        userRepository.save(user);
    }
}
