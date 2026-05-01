package com.vibook.backend.service;

import com.vibook.backend.dto.CategoryAdminResponse;
import com.vibook.backend.dto.CategoryCreateRequest;
import com.vibook.backend.dto.CategoryUpdateRequest;
import java.util.List;

public interface AdminCategoryService {

    List<CategoryAdminResponse> listAllWithUsage();

    CategoryAdminResponse create(CategoryCreateRequest request);

    CategoryAdminResponse update(Long id, CategoryUpdateRequest request);

    void delete(Long id);
}
