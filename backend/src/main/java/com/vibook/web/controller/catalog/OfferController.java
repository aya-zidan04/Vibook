package com.vibook.web.controller.catalog;

import com.vibook.service.catalog.CatalogReadService;
import com.vibook.web.dto.catalog.OfferResponse;
import com.vibook.web.dto.common.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/offers")
@Validated
public class OfferController {

    private final CatalogReadService catalogReadService;

    public OfferController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping
    public PageResponse<OfferResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sort
    ) {
        return catalogReadService.listOffers(q, page, size, sort);
    }
}
