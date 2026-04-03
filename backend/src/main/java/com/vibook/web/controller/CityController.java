package com.vibook.web.controller;

import com.vibook.service.ReferenceDataService;
import com.vibook.web.dto.reference.CityResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cities")
public class CityController {

    private final ReferenceDataService referenceDataService;

    public CityController(ReferenceDataService referenceDataService) {
        this.referenceDataService = referenceDataService;
    }

    @GetMapping
    public List<CityResponse> listCities() {
        return referenceDataService.listCities();
    }
}
