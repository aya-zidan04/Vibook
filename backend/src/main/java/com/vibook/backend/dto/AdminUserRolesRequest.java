package com.vibook.backend.dto;

import com.vibook.backend.entity.RoleName;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record AdminUserRolesRequest(@NotEmpty Set<RoleName> roles) {
}
