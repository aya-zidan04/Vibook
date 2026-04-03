package com.vibook.web.controller;

import com.vibook.service.BusinessLeadService;
import com.vibook.web.dto.business.BusinessLeadResponse;
import com.vibook.web.dto.business.CreateBusinessLeadRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/business/leads")
public class BusinessLeadController {

    private final BusinessLeadService businessLeadService;

    public BusinessLeadController(BusinessLeadService businessLeadService) {
        this.businessLeadService = businessLeadService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BusinessLeadResponse submitLead(@Valid @RequestBody CreateBusinessLeadRequest request) {
        return businessLeadService.submitLead(request);
    }
}
