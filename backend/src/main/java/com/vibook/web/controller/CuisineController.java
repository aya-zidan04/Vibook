package com.vibook.web.controller;

import com.vibook.service.ReferenceDataService;
import com.vibook.web.dto.reference.CuisineResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cuisines")
public class CuisineController {

    private final ReferenceDataService referenceDataService;

    public CuisineController(ReferenceDataService referenceDataService) {
        this.referenceDataService = referenceDataService;
    }

    @GetMapping
    public List<CuisineResponse> listCuisines() {
        return referenceDataService.listCuisines();
    }
}
