package com.vibook.service;

import com.vibook.repository.CategoryRepository;
import com.vibook.repository.CityRepository;
import com.vibook.repository.CuisineRepository;
import com.vibook.web.dto.reference.CategoryResponse;
import com.vibook.web.dto.reference.CityResponse;
import com.vibook.web.dto.reference.CuisineResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReferenceDataService {

    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final CuisineRepository cuisineRepository;

    public ReferenceDataService(
            CityRepository cityRepository,
            CategoryRepository categoryRepository,
            CuisineRepository cuisineRepository
    ) {
        this.cityRepository = cityRepository;
        this.categoryRepository = categoryRepository;
        this.cuisineRepository = cuisineRepository;
    }

    @Transactional(readOnly = true)
    public List<CityResponse> listCities() {
        return cityRepository.findAllByOrderByNameEnAsc().stream()
                .map(CityResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAllByOrderByLabelEnAsc().stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CuisineResponse> listCuisines() {
        return cuisineRepository.findAllByOrderByLabelEnAsc().stream()
                .map(CuisineResponse::fromEntity)
                .toList();
    }
}
