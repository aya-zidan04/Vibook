package com.vibook.backend.mapper;

import com.vibook.backend.dto.CategoryResponse;
import com.vibook.backend.dto.SubcategoryResponse;
import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Subcategory;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(
            category.getId(),
            category.getName(),
            category.getSlug(),
            category.getIcon(),
            category.isActive()
        );
    }

    public SubcategoryResponse toSubcategoryResponse(Subcategory subcategory) {
        return new SubcategoryResponse(
            subcategory.getId(),
            subcategory.getCategory().getId(),
            subcategory.getName(),
            subcategory.getSlug(),
            subcategory.isActive()
        );
    }
}
