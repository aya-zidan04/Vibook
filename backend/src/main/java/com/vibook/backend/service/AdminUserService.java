package com.vibook.backend.service;

import com.vibook.backend.dto.AdminUserRolesRequest;
import com.vibook.backend.dto.UserResponse;

public interface AdminUserService {

    UserResponse updateRoles(Long userId, AdminUserRolesRequest request);

    UserResponse enableUser(Long userId);

    void disableUser(Long userId);
}
