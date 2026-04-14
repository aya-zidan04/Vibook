package com.vibook.backend.service;

import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.dto.UpdateUserRequest;
import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getCurrentUser();
    UserResponse updateUser(Long id, UpdateUserRequest request);
    void disableUser(Long id);
}
