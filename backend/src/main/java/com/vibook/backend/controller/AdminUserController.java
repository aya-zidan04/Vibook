package com.vibook.backend.controller;

import com.vibook.backend.dto.AdminUserRolesRequest;
import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @PatchMapping("/{id}/roles")
    public ResponseEntity<UserResponse> roles(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody AdminUserRolesRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminUserService.updateRoles(id, request));
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<UserResponse> enable(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminUserService.enableUser(id));
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disable(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        adminUserService.disableUser(id);
        return ResponseEntity.noContent().build();
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
