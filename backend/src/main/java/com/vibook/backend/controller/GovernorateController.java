package com.vibook.backend.controller;

import com.vibook.backend.dto.GovernorateRequest;
import com.vibook.backend.dto.GovernorateResponse;
import com.vibook.backend.service.GovernorateService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/governorates")
public class GovernorateController {

    private final GovernorateService governorateService;

    public GovernorateController(GovernorateService governorateService) {
        this.governorateService = governorateService;
    }

    @PostMapping
    public ResponseEntity<GovernorateResponse> create(@Valid @RequestBody GovernorateRequest request) {
        GovernorateResponse body = governorateService.createGovernorate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping
    public ResponseEntity<List<GovernorateResponse>> getAll() {
        return ResponseEntity.ok(governorateService.getAllGovernorates());
    }

    @GetMapping("/active")
    public ResponseEntity<List<GovernorateResponse>> getActive() {
        return ResponseEntity.ok(governorateService.getActiveGovernorates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GovernorateResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(governorateService.getGovernorateById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GovernorateResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody GovernorateRequest request
    ) {
        return ResponseEntity.ok(governorateService.updateGovernorate(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        governorateService.deleteGovernorate(id);
        return ResponseEntity.noContent().build();
    }
}
