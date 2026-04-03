package com.vibook.web.controller.catalog;

import com.vibook.service.catalog.CatalogReadService;
import com.vibook.web.dto.catalog.RestaurantResponse;
import com.vibook.web.dto.common.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/restaurants")
@Validated
public class RestaurantController {

    private final CatalogReadService catalogReadService;

    public RestaurantController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping
    public PageResponse<RestaurantResponse> list(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) Long cuisineId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sort
    ) {
        return catalogReadService.listRestaurants(cityId, cuisineId, q, page, size, sort);
    }

    @GetMapping("/{id}")
    public RestaurantResponse get(@PathVariable long id) {
        return catalogReadService.getRestaurant(id);
    }
}
