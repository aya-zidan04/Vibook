package com.vibook.backend.service.impl;

import com.vibook.backend.dto.CategoryAdminResponse;
import com.vibook.backend.dto.CategoryCreateRequest;
import com.vibook.backend.dto.CategoryUpdateRequest;
import com.vibook.backend.entity.AdminActivityAction;
import com.vibook.backend.entity.Category;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.repository.BusinessProfileRepository;
import com.vibook.backend.repository.CategoryRepository;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.AdminActivityLogService;
import com.vibook.backend.service.AdminCategoryService;
import com.vibook.backend.util.AdminSecurityUtils;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private static final String ENTITY_CATEGORY = "CATEGORY";

    private final CategoryRepository categoryRepository;
    private final BusinessProfileRepository businessProfileRepository;
    private final AdminActivityLogService adminActivityLogService;

    public AdminCategoryServiceImpl(
        CategoryRepository categoryRepository,
        BusinessProfileRepository businessProfileRepository,
        AdminActivityLogService adminActivityLogService
    ) {
        this.categoryRepository = categoryRepository;
        this.businessProfileRepository = businessProfileRepository;
        this.adminActivityLogService = adminActivityLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryAdminResponse> listAllWithUsage() {
        return categoryRepository
            .findAllByOrderByNameAsc()
            .stream()
            .map(
                c -> new CategoryAdminResponse(
                    c.getId(),
                    c.getName(),
                    c.getSlug(),
                    c.getIcon(),
                    c.isActive(),
                    businessProfileRepository.countByPrimaryCategory_Id(c.getId())
                )
            )
            .toList();
    }

    @Override
    @Transactional
    public CategoryAdminResponse create(CategoryCreateRequest request) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new BadRequestException("Slug already exists");
        }
        Category c = new Category();
        c.setName(request.name().trim());
        c.setSlug(request.slug().trim());
        c.setIcon(request.icon() != null ? request.icon().trim() : null);
        c.setActive(request.active());
        Category saved = categoryRepository.save(c);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.CREATE_CATEGORY,
            ENTITY_CATEGORY,
            saved.getId(),
            saved.getName()
        );
        return toAdminResponse(saved);
    }

    @Override
    @Transactional
    public CategoryAdminResponse update(Long id, CategoryUpdateRequest request) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        Category c = categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        if (categoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new BadRequestException("Slug already exists");
        }
        c.setName(request.name().trim());
        c.setSlug(request.slug().trim());
        c.setIcon(request.icon() != null ? request.icon().trim() : null);
        c.setActive(request.active());
        Category saved = categoryRepository.save(c);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.UPDATE_CATEGORY,
            ENTITY_CATEGORY,
            id,
            saved.getName()
        );
        return toAdminResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        AuthenticatedUser admin = AdminSecurityUtils.requireAuthenticatedUser();
        Category c = categoryRepository.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
        long usage = businessProfileRepository.countByPrimaryCategory_Id(id);
        if (usage > 0) {
            throw new BadRequestException("Cannot delete category in use by " + usage + " business profile(s)");
        }
        categoryRepository.delete(c);
        adminActivityLogService.log(
            admin.getUser().getId(),
            admin.getUsername(),
            AdminActivityAction.DELETE_CATEGORY,
            ENTITY_CATEGORY,
            id,
            c.getName()
        );
    }

    private CategoryAdminResponse toAdminResponse(Category c) {
        return new CategoryAdminResponse(
            c.getId(),
            c.getName(),
            c.getSlug(),
            c.getIcon(),
            c.isActive(),
            businessProfileRepository.countByPrimaryCategory_Id(c.getId())
        );
    }
}
