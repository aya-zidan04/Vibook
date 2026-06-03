package com.vibook.backend.service.impl;

import com.vibook.backend.dto.CategoryResponse;
import com.vibook.backend.dto.SubcategoryResponse;
import com.vibook.backend.entity.Category;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.CategoryMapper;
import com.vibook.backend.repository.CategoryRepository;
import com.vibook.backend.repository.SubcategoryRepository;
import com.vibook.backend.service.CategoryService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryServiceImpl(
        CategoryRepository categoryRepository,
        SubcategoryRepository subcategoryRepository,
        CategoryMapper categoryMapper
    ) {
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> listActiveCategories() {
        return categoryRepository.findAllByActiveIsTrueOrderByNameAsc().stream()
            .map(categoryMapper::toCategoryResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubcategoryResponse> listActiveSubcategoriesByCategoryId(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new NotFoundException("Category not found"));
        if (!category.isActive()) {
            throw new NotFoundException("Category not found");
        }
        return subcategoryRepository.findAllByCategory_IdAndActiveIsTrueOrderByNameAsc(categoryId).stream()
            .map(categoryMapper::toSubcategoryResponse)
            .toList();
    }
}
