package com.vibook.backend.service;

import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.dto.UpdateUserRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse getCurrentUser();
    UserResponse updateUser(Long id, UpdateUserRequest request);

    UserResponse updateProfileImage(MultipartFile image);

    /** Clears optional profile image URL and removes the stored file when applicable. */
    UserResponse clearProfileImage();

    void disableUser(Long id);
}
