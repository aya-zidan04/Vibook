package com.vibook.backend.service;

import com.vibook.backend.dto.CategoryResponse;
import com.vibook.backend.dto.SubcategoryResponse;
import java.util.List;

public interface CategoryService {

    List<CategoryResponse> listActiveCategories();

    CategoryResponse getActiveCategoryBySlug(String slug);

    List<SubcategoryResponse> listActiveSubcategoriesByCategoryId(Long categoryId);
}
