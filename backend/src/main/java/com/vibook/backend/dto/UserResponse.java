package com.vibook.backend.dto;

import com.vibook.backend.entity.RoleName;
import java.time.Instant;
import java.util.Set;

public record UserResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    boolean enabled,
    Instant createdAt,
    Instant updatedAt,
    Set<RoleName> roles
) {
}
