package com.vibook.backend.controller;

import com.vibook.backend.dto.BusinessProfileResponse;
import com.vibook.backend.dto.BusinessProfileUpsertRequest;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.security.AuthenticatedUser;
import com.vibook.backend.service.BusinessProfileService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/business-profile")
public class BusinessProfileController {

    private final BusinessProfileService businessProfileService;

    public BusinessProfileController(BusinessProfileService businessProfileService) {
        this.businessProfileService = businessProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<BusinessProfileResponse> getMyProfile(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.getMyProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<BusinessProfileResponse> upsertMyProfile(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @Valid @RequestBody BusinessProfileUpsertRequest request
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.upsertMyProfile(request));
    }

    @PatchMapping("/me/submit")
    public ResponseEntity<BusinessProfileResponse> submitForReview(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.submitMyProfileForReview());
    }

    @PostMapping(value = "/me/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BusinessProfileResponse> uploadLogo(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestPart("image") MultipartFile image
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.uploadLogo(image));
    }

    @DeleteMapping("/me/logo")
    public ResponseEntity<BusinessProfileResponse> deleteLogo(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.deleteLogo());
    }

    @PostMapping(value = "/me/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BusinessProfileResponse> uploadBanner(
        @AuthenticationPrincipal AuthenticatedUser principal,
        @RequestPart("image") MultipartFile image
    ) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.uploadBanner(image));
    }

    @DeleteMapping("/me/banner")
    public ResponseEntity<BusinessProfileResponse> deleteBanner(@AuthenticationPrincipal AuthenticatedUser principal) {
        requirePrincipal(principal);
        return ResponseEntity.ok(businessProfileService.deleteBanner());
    }

    private static void requirePrincipal(AuthenticatedUser principal) {
        if (principal == null) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
