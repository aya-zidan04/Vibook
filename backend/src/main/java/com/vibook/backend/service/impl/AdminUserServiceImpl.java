package com.vibook.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibook.backend.dto.AdminUserRolesRequest;
import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.entity.AdminActivityAction;
import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.RoleName;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.UserMapper;
import com.vibook.backend.repository.RoleRepository;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminActivityLogService;
import com.vibook.backend.service.AdminUserService;
import com.vibook.backend.util.AdminSecurityUtils;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private static final String ENTITY_USER = "USER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final AdminActivityLogService adminActivityLogService;
    private final ObjectMapper objectMapper;

    public AdminUserServiceImpl(
        UserRepository userRepository,
        RoleRepository roleRepository,
        UserMapper userMapper,
        AdminActivityLogService adminActivityLogService,
        ObjectMapper objectMapper
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.adminActivityLogService = adminActivityLogService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public UserResponse updateRoles(Long userId, AdminUserRolesRequest request) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        if (admin.getUser().getId().equals(userId)) {
            throw new BadRequestException("You cannot change your own roles from this screen");
        }
        if (!request.roles().contains(RoleName.ROLE_USER)) {
            throw new BadRequestException("ROLE_USER must be included");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Set<RoleName> before = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        user.getRoles().clear();
        for (RoleName name : request.roles()) {
            Role role = roleRepository.findByName(name).orElseThrow(() -> new BadRequestException("Unknown role: " + name));
            user.getRoles().add(role);
        }
        User saved = userRepository.save(user);
        Set<RoleName> after = saved.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.UPDATE_USER_ROLES,
            ENTITY_USER,
            userId,
            toJsonDetails(Map.of("before", before.toString(), "after", after.toString()))
        );
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse enableUser(Long userId) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.ENABLE_USER,
            ENTITY_USER,
            userId,
            null
        );
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void disableUser(Long userId) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        if (admin.getUser().getId().equals(userId)) {
            throw new BadRequestException("You cannot disable your own account");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.DISABLE_USER,
            ENTITY_USER,
            userId,
            null
        );
    }

    private String toJsonDetails(Map<String, String> map) {
        try {
            return objectMapper.writeValueAsString(new HashMap<>(map));
        } catch (JsonProcessingException e) {
            return map.toString();
        }
    }
}
