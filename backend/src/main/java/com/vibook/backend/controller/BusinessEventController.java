package com.vibook.backend.controller;

import com.vibook.backend.dto.BusinessEventResponse;
import com.vibook.backend.dto.BusinessEventSummaryResponse;
import com.vibook.backend.dto.BusinessEventUpsertRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BusinessEventService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/business/events")
public class BusinessEventController {

    private final BusinessEventService businessEventService;

    public BusinessEventController(BusinessEventService businessEventService) {
        this.businessEventService = businessEventService;
    }

    @PostMapping
    public ResponseEntity<BusinessEventResponse> create(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody BusinessEventUpsertRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BusinessEventSummaryResponse>> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.listMyBusinessEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessEventResponse> getById(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.getByIdForOwnerOrAdmin(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessEventResponse> update(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @Valid @RequestBody BusinessEventUpsertRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        businessEventService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/hide")
    public ResponseEntity<BusinessEventResponse> hide(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.hide(id));
    }

    @PatchMapping("/{id}/unhide")
    public ResponseEntity<BusinessEventResponse> unhide(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.unhide(id));
    }

    @PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BusinessEventResponse> uploadPhoto(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @RequestPart("image") MultipartFile image
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.uploadPhoto(id, image));
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<BusinessEventResponse> deletePhoto(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @PathVariable Long id,
        @PathVariable Long photoId
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessEventService.deletePhoto(id, photoId));
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
