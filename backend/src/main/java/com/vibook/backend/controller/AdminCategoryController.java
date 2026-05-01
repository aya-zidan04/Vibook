package com.vibook.backend.controller;

import com.vibook.backend.dto.CategoryAdminResponse;
import com.vibook.backend.dto.CategoryCreateRequest;
import com.vibook.backend.dto.CategoryUpdateRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminCategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    public AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryAdminResponse>> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminCategoryService.listAllWithUsage());
    }

    @PostMapping
    public ResponseEntity<CategoryAdminResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody CategoryCreateRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryAdminResponse> update(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody CategoryUpdateRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(adminCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        adminCategoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
