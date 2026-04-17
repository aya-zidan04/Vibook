package com.vibook.backend.controller;

import com.vibook.backend.dto.CategoryResponse;
import com.vibook.backend.dto.SubcategoryResponse;
import com.vibook.backend.service.CategoryService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(categoryService.listActiveCategories());
    }

    /**
     * Resolved before {@code /{id}/subcategories} so {@code slug} is never parsed as a numeric id.
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<CategoryResponse> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(categoryService.getActiveCategoryBySlug(slug));
    }

    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<SubcategoryResponse>> listSubcategories(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.listActiveSubcategoriesByCategoryId(id));
    }
}
