package com.vibook.backend.mapper;

import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.entity.Role;
import com.vibook.backend.entity.User;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getProfileImageUrl(),
            user.isEnabled(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );
    }
}
