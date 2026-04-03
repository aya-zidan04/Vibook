package com.vibook.web.controller;

import com.vibook.service.ReferenceDataService;
import com.vibook.web.dto.reference.CategoryResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final ReferenceDataService referenceDataService;

    public CategoryController(ReferenceDataService referenceDataService) {
        this.referenceDataService = referenceDataService;
    }

    @GetMapping
    public List<CategoryResponse> listCategories() {
        return referenceDataService.listCategories();
    }
}
